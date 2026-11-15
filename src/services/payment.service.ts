import type { Types } from "mongoose";
import { Payment } from "@/models/Payment";
import { Membership } from "@/models/Membership";
import { User } from "@/models/User";
import { Errors } from "@/lib/errors";
import { withTransaction } from "@/lib/db";
import { makeReference, randomHex } from "@/lib/ids";
import { razorpayConfigured, razorpayCreateOrder, razorpayRefund, verifyCheckoutSignature } from "@/lib/payments/razorpay";
import { applyMembershipRecharge } from "@/services/membership.service";
import { getMembershipConfig, getRechargePlans } from "@/services/settings.service";
import { notify } from "@/services/notification.service";
import { debitPoints } from "@/services/wallet.service";
import { logAudit } from "@/services/audit.service";
import type { AuthUser } from "@/lib/auth/session";

type Id = string | Types.ObjectId;

export function paymentMode(): "RAZORPAY" | "DEMO" {
  return razorpayConfigured() ? "RAZORPAY" : "DEMO";
}

/** Resolves the recharge plan for a requested amount; defaults to the largest plan. */
export async function resolveRechargePlan(amount?: number) {
  const plans = await getRechargePlans();
  if (amount === undefined || amount === null) return plans[plans.length - 1];
  const plan = plans.find((p) => p.amount === Number(amount));
  if (!plan) throw Errors.badRequest("Selected recharge plan is not available");
  return plan;
}

/** Step 1: create a payment order on the backend. Amount and benefits always come from server settings. */
export async function createMembershipPaymentOrder(user: AuthUser, planAmount?: number) {
  const cfg = await resolveRechargePlan(planAmount);
  const membership = await Membership.findOne({ customer: user.id }).lean();
  if (!membership) throw Errors.notFound("Membership");
  const purpose = (membership.rechargeCount ?? 0) === 0 ? "MEMBERSHIP_PURCHASE" : "MEMBERSHIP_RECHARGE";
  const provider = paymentMode();
  const receipt = makeReference(provider === "DEMO" ? "DEMO-PAY" : "PAY");

  let providerOrderId: string;
  if (provider === "RAZORPAY") {
    const order = await razorpayCreateOrder(cfg.amount, receipt, { customerId: user.id, purpose });
    providerOrderId = order.id;
  } else {
    providerOrderId = `demo_order_${randomHex(8).toLowerCase()}`;
  }

  const payment = await Payment.create({
    customer: user.id,
    purpose,
    amount: cfg.amount,
    pointsGranted: cfg.points,
    hoursGranted: cfg.hours,
    provider,
    providerOrderId,
    receipt,
    status: "CREATED",
    isDemo: provider === "DEMO",
    events: [{ event: "order.created", source: "server" }],
  });

  return {
    paymentId: String(payment._id),
    provider,
    isDemo: provider === "DEMO",
    keyId: provider === "RAZORPAY" ? process.env.RAZORPAY_KEY_ID : undefined,
    orderId: providerOrderId,
    amount: cfg.amount,
    amountPaise: cfg.amount * 100,
    currency: "INR",
    receipt,
    purpose,
    benefits: { points: cfg.points, hours: cfg.hours },
    prefill: { name: user.name, email: user.email, contact: user.mobile },
  };
}

/**
 * Marks a payment successful exactly once and applies membership benefits in the same
 * transaction. Repeated calls (client verify + webhook, duplicate webhooks) are no-ops.
 */
export async function markPaymentSuccess(paymentId: Id, providerPaymentId: string | undefined, source: string, signature?: string) {
  return withTransaction(async (session) => {
    const o = session ? { session } : {};
    const won = await Payment.findOneAndUpdate(
      { _id: paymentId, status: { $in: ["CREATED", "PENDING", "FAILED"] } },
      {
        $set: { status: "SUCCESS", processedAt: new Date(), ...(providerPaymentId ? { providerPaymentId } : {}), ...(signature ? { signature } : {}) },
        $unset: { failureReason: 1 },
        $push: { events: { event: "payment.success", source, at: new Date() } },
      },
      { new: true, ...o }
    );
    if (!won) {
      const existing = await Payment.findById(paymentId, null, o).lean();
      if (!existing) throw Errors.notFound("Payment");
      if (existing.status === "SUCCESS") return { payment: existing, duplicate: true };
      throw Errors.business("PAYMENT_STATE", `Payment cannot be completed from status ${existing.status}`);
    }
    await applyMembershipRecharge(won._id, session);
    return { payment: won.toObject(), duplicate: false };
  });
}

export async function markPaymentFailed(paymentId: Id, reason: string, source: string) {
  const updated = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $in: ["CREATED", "PENDING"] } },
    { $set: { status: "FAILED", failureReason: reason.slice(0, 300) }, $push: { events: { event: "payment.failed", source, at: new Date() } } },
    { new: true }
  );
  if (updated) {
    await notify(updated.customer, "PAYMENT_FAILED", "Payment failed", `Your payment ${updated.receipt} failed: ${reason}`, {
      link: "/customer/membership",
      isDemo: updated.isDemo,
    });
  }
  return updated;
}

/** Step 2 (Razorpay): verify checkout signature on the server. Never trust client success alone. */
export async function verifyRazorpayCheckout(
  user: AuthUser,
  input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
) {
  const payment = await Payment.findOne({ providerOrderId: input.razorpay_order_id, provider: "RAZORPAY" });
  if (!payment || String(payment.customer) !== user.id) throw Errors.notFound("Payment");
  if (!verifyCheckoutSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    await markPaymentFailed(payment._id, "Signature verification failed", "client-verify");
    throw Errors.business("INVALID_SIGNATURE", "Payment signature verification failed");
  }
  return markPaymentSuccess(payment._id, input.razorpay_payment_id, "client-verify", input.razorpay_signature);
}

/**
 * DEMO MODE ONLY. Simulates a gateway outcome for a DEMO payment. Completely separate from
 * the Razorpay path and refuses to touch RAZORPAY payments.
 */
export async function completeDemoPayment(user: AuthUser, paymentId: string, outcome: "SUCCESS" | "FAILED") {
  if (paymentMode() !== "DEMO") throw Errors.forbidden("Demo payments are disabled while Razorpay is configured");
  const payment = await Payment.findById(paymentId);
  if (!payment || String(payment.customer) !== user.id) throw Errors.notFound("Payment");
  if (payment.provider !== "DEMO") throw Errors.forbidden("Only DEMO payments can be simulated");
  if (outcome === "FAILED") {
    const p = await markPaymentFailed(payment._id, "Simulated failure (demo mode)", "demo-simulator");
    return { status: p?.status ?? payment.status };
  }
  const res = await markPaymentSuccess(payment._id, `demo_pay_${randomHex(7).toLowerCase()}`, "demo-simulator");
  return { status: "SUCCESS", duplicate: res.duplicate };
}

/**
 * Admin refund of a membership payment. Policy (PENDING CLIENT APPROVAL): the points credited
 * by that payment are reversed; refund is refused if the customer has already spent them.
 */
export async function refundMembershipPayment(admin: AuthUser, paymentId: string, reason: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw Errors.notFound("Payment");
  if (payment.status !== "SUCCESS") throw Errors.business("PAYMENT_STATE", "Only successful payments can be refunded");
  const cfg = await getMembershipConfig();

  if (payment.provider === "RAZORPAY" && payment.providerPaymentId) {
    await razorpayRefund(payment.providerPaymentId, payment.amount);
  }

  await withTransaction(async (session) => {
    const o = session ? { session } : {};
    const updated = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "SUCCESS" },
      { $set: { status: "REFUNDED", refundedAt: new Date(), refundReason: reason }, $push: { events: { event: "payment.refunded", source: "admin" } } },
      { new: true, ...o }
    );
    if (!updated) throw Errors.conflict("Payment was already refunded");
    await debitPoints({
      customerId: payment.customer,
      points: payment.pointsGranted ?? cfg.points,
      source: "ADMIN",
      reference: `REFUND-${payment.receipt}`,
      description: `Reversal of points for refunded payment ${payment.receipt}`,
      performedBy: admin.id,
      session,
      isDemo: payment.isDemo,
    });
    await notify(payment.customer, "REFUND_PROCESSED", "Payment refunded", `₹${payment.amount} for ${payment.receipt} has been refunded.`, {
      link: "/customer/transactions",
      session,
    });
  });
  await logAudit(admin, "PAYMENT_REFUNDED", "Payment", payment._id, { reason, amount: payment.amount });
  return Payment.findById(payment._id).lean();
}

export async function getPaymentForUser(user: AuthUser, paymentId: string) {
  const p = await Payment.findById(paymentId).lean();
  if (!p || (user.role !== "SUPER_ADMIN" && String(p.customer) !== user.id)) throw Errors.notFound("Payment");
  const customer = await User.findById(p.customer).select("name email").lean();
  return { ...p, customer };
}

