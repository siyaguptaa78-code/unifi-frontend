import { randomInt } from "crypto";
import { MembershipCard } from "@/models/MembershipCard";
import { Membership } from "@/models/Membership";
import { VisitSession } from "@/models/VisitSession";
import { VisitOtp } from "@/models/VisitOtp";
import { Cafe } from "@/models/Cafe";
import { User } from "@/models/User";
import { Errors } from "@/lib/errors";
import { sha256 } from "@/lib/ids";
import { assertCafeAccess } from "@/services/scope.service";
import { notify } from "@/services/notification.service";
import { normalizeUid } from "@/services/card.service";
import { processScan, type ScanInput } from "@/services/visit.service";
import type { AuthUser } from "@/lib/auth/session";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Step 1 of an OTP-confirmed card tap: runs the same eligibility checks as a direct scan, then
 * sends a 6-digit code to the customer. Nothing changes on the visit/membership until step 2.
 */
export async function requestVisitOtp(actor: AuthUser, input: ScanInput) {
  const uid = normalizeUid(input.uid);
  await assertCafeAccess(actor, input.cafeId);
  const cafe = await Cafe.findById(input.cafeId).lean();
  if (!cafe) throw Errors.notFound("Cafe");
  if (cafe.status !== "ACTIVE") throw Errors.business("CAFE_INACTIVE", "This cafe is not currently active");

  const card = await MembershipCard.findOne({ uid }).lean();
  if (!card) throw Errors.business("CARD_NOT_FOUND", "Card not recognised. Please register the card first.");
  if (card.status !== "ACTIVE") throw Errors.business("CARD_NOT_ACTIVE", `Card is ${card.status.toLowerCase()}. Entry/exit denied.`);

  const active = await VisitSession.findOne({ customer: card.customer, status: "ACTIVE" }).lean();
  const action: "ENTRY" | "EXIT" = input.mode === "AUTO" ? (active ? "EXIT" : "ENTRY") : input.mode;
  if (action === "EXIT" && !active) throw Errors.business("NO_ACTIVE_SESSION", "Customer has no active visit to check out from.");
  if (action === "ENTRY") {
    if (active) throw Errors.business("ALREADY_CHECKED_IN", "Customer already has an active visit session.");
    const membership = await Membership.findOne({ customer: card.customer }).lean();
    if (!membership || membership.status !== "ACTIVE") {
      throw Errors.business("MEMBERSHIP_INACTIVE", "Membership is not active. Please purchase or recharge membership.");
    }
    if (membership.remainingMinutes <= 0) throw Errors.business("HOURS_EXHAUSTED", "Membership hours exhausted. Entry denied until recharge.");
  }

  // Only one live code per customer.
  await VisitOtp.updateMany({ customer: card.customer, status: "PENDING" }, { $set: { status: "EXPIRED" } });
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const otp = await VisitOtp.create({
    customer: card.customer,
    card: card._id,
    cafe: cafe._id,
    action,
    code,
    codeHash: sha256(code),
    requestedBy: actor.id,
    deviceId: input.deviceId,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  await notify(
    card.customer,
    "VISIT_OTP",
    `Your ${action === "ENTRY" ? "entry" : "exit"} code: ${code}`,
    `Share code ${code} with the UniCafe staff at ${cafe.name} to confirm your ${action === "ENTRY" ? "check-in" : "check-out"}. Valid for 5 minutes. Never share it with anyone else.`,
    { link: "/customer/dashboard" }
  );
  const customer = await User.findById(card.customer).select("name mobile").lean();
  const mobile = customer?.mobile ?? "";
  return {
    otpRequired: true as const,
    otpRequestId: String(otp._id),
    action,
    expiresAt: otp.expiresAt,
    customer: { name: customer?.name, mobileMasked: mobile ? `******${mobile.slice(-4)}` : "" },
    cafe: { id: String(cafe._id), name: cafe.name },
    message: `OTP sent to ${customer?.name ?? "the customer"}. Ask them for the 6-digit code.`,
  };
}

/** Step 2: verifies the code and performs the entry/exit exactly once. */
export async function verifyVisitOtp(actor: AuthUser, otpRequestId: string, code: string, ip?: string) {
  const otp = await VisitOtp.findById(otpRequestId);
  if (!otp) throw Errors.notFound("OTP request");
  await assertCafeAccess(actor, otp.cafe);
  if (otp.status !== "PENDING") throw Errors.business("OTP_INVALID", "This code was already used or has been replaced. Tap the card again.");
  if (otp.expiresAt.getTime() < Date.now()) {
    otp.status = "EXPIRED";
    await otp.save();
    throw Errors.business("OTP_EXPIRED", "The code has expired. Tap the card again to send a new one.");
  }
  if (sha256(code.trim()) !== otp.codeHash) {
    otp.attempts += 1;
    if (otp.attempts >= MAX_ATTEMPTS) otp.status = "LOCKED";
    await otp.save();
    throw Errors.business(
      "OTP_MISMATCH",
      otp.status === "LOCKED" ? "Too many wrong attempts. Tap the card again to send a new code." : `Incorrect code. ${MAX_ATTEMPTS - otp.attempts} attempts left.`
    );
  }
  // Claim the OTP atomically so a double-submit cannot run the action twice.
  const claimed = await VisitOtp.findOneAndUpdate({ _id: otp._id, status: "PENDING" }, { $set: { status: "USED", code: "------" } });
  if (!claimed) throw Errors.business("OTP_INVALID", "This code was already used.");
  const card = await MembershipCard.findById(otp.card).select("uid").lean();
  if (!card) throw Errors.notFound("Card");
  return processScan(actor, { uid: card.uid, cafeId: String(otp.cafe), mode: otp.action, deviceId: otp.deviceId || "OTP" }, ip);
}

/** Customer app: the live code to show on screen (if any). */
export async function getActiveVisitOtp(customerId: string) {
  const otp = await VisitOtp.findOne({ customer: customerId, status: "PENDING", expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .populate("cafe", "name")
    .lean();
  if (!otp) return null;
  return {
    code: otp.code,
    action: otp.action,
    expiresAt: otp.expiresAt,
    cafe: (otp.cafe as unknown as { name?: string })?.name ?? "",
  };
}
