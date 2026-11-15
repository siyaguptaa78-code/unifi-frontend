import { Types } from "mongoose";
import { Order } from "@/models/Order";
import { OrderItem } from "@/models/OrderItem";
import { Payment } from "@/models/Payment";
import { BookSale } from "@/models/BookSale";
import { Cafe } from "@/models/Cafe";
import { User } from "@/models/User";
import { CustomerProfile } from "@/models/CustomerProfile";
import { Errors } from "@/lib/errors";
import { canAccessCafe } from "@/services/scope.service";
import type { AuthUser } from "@/lib/auth/session";

export type InvoiceKind = "order" | "payment" | "book";

export type Invoice = {
  kind: InvoiceKind;
  number: string;
  title: string;
  issuedAt: Date;
  status: string;
  currency: "INR" | "POINTS";
  seller: { name: string; address?: string; phone?: string; email?: string };
  billTo: { name: string; email?: string; mobile?: string; customerCode?: string };
  lines: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal: number;
  total: number;
  paymentMode: string;
  notes: string[];
};

const COMPANY = { name: "UniCafe Hospitality", address: "India", email: "support@unicafe.app" };

async function billTo(customerId: Types.ObjectId | string) {
  const [u, p] = await Promise.all([
    User.findById(customerId).select("name email mobile").lean(),
    CustomerProfile.findOne({ user: customerId }).select("customerCode").lean(),
  ]);
  return { name: u?.name ?? "Customer", email: u?.email, mobile: u?.mobile, customerCode: p?.customerCode };
}

async function sellerFor(cafeId: Types.ObjectId | string | null | undefined) {
  if (!cafeId) return COMPANY;
  const c = await Cafe.findById(cafeId).select("name address phone email").lean();
  if (!c) return COMPANY;
  const a = c.address;
  return {
    name: `UniCafe — ${c.name}`,
    address: [a?.line1, a?.area, a?.city, a?.state, a?.pincode].filter(Boolean).join(", "),
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
  };
}

/** Customers may view their own invoices; staff only for cafes in their scope; Super Admin all. */
async function assertInvoiceAccess(user: AuthUser, customerId: unknown, cafeId?: unknown) {
  if (user.role === "SUPER_ADMIN") return;
  if (user.role === "CUSTOMER") {
    if (String(customerId) !== user.id) throw Errors.notFound("Invoice");
    return;
  }
  if (!cafeId || !(await canAccessCafe(user, String(cafeId)))) throw Errors.notFound("Invoice");
}

export async function getInvoice(user: AuthUser, kind: InvoiceKind, id: string): Promise<Invoice> {
  if (!Types.ObjectId.isValid(id)) throw Errors.notFound("Invoice");

  if (kind === "order") {
    const order = await Order.findById(id).lean();
    if (!order) throw Errors.notFound("Invoice");
    await assertInvoiceAccess(user, order.customer, order.cafe);
    const items = await OrderItem.find({ order: order._id }).lean();
    const lines = items.map((it) => ({ description: it.name, quantity: it.quantity, rate: it.unitPoints, amount: it.lineTotal }));
    const notes = [
      order.channel === "COUNTER" ? "Billed at the counter to the customer's membership card." : "Ordered through the UniCafe app.",
      "1 point = ₹1. Paid from the membership points wallet.",
    ];
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      notes.push(`Order ${order.status.toLowerCase()} — ${order.refundedPoints || order.totalPoints} points refunded to wallet.`);
    }
    return {
      kind,
      number: `INV-${order.orderNumber}`,
      title: "Food & Beverage Invoice",
      issuedAt: order.createdAt as Date,
      status: order.status,
      currency: "POINTS",
      seller: await sellerFor(order.cafe),
      billTo: await billTo(order.customer),
      lines,
      subtotal: order.totalPoints,
      total: order.totalPoints,
      paymentMode: "Membership points wallet",
      notes,
    };
  }

  if (kind === "payment") {
    const p = await Payment.findById(id).lean();
    if (!p) throw Errors.notFound("Invoice");
    await assertInvoiceAccess(user, p.customer);
    const hours = p.hoursGranted ?? 0;
    const desc =
      `${p.purpose === "MEMBERSHIP_PURCHASE" ? "Membership purchase" : "Membership recharge"} — ` +
      `${(p.pointsGranted ?? p.amount).toLocaleString("en-IN")} points${hours > 0 ? ` + ${hours} hours cafe access` : ""}`;
    const notes = [p.isDemo ? "DEMO payment — simulated, no money was charged." : `Paid via ${p.provider}.`];
    if (p.status === "REFUNDED") notes.push(`Refunded on ${p.refundedAt ? new Date(p.refundedAt).toLocaleDateString("en-IN") : "—"}.`);
    return {
      kind,
      number: `INV-${p.receipt}`,
      title: "Membership Payment Invoice",
      issuedAt: (p.processedAt ?? p.createdAt) as Date,
      status: p.status,
      currency: "INR",
      seller: COMPANY,
      billTo: await billTo(p.customer),
      lines: [{ description: desc, quantity: 1, rate: p.amount, amount: p.amount }],
      subtotal: p.amount,
      total: p.amount,
      paymentMode: p.provider === "DEMO" ? "Demo (simulated)" : `Online — ${p.provider}${p.providerPaymentId ? ` (${p.providerPaymentId})` : ""}`,
      notes,
    };
  }

  if (kind === "book") {
    const sale = await BookSale.findById(id).lean();
    if (!sale) throw Errors.notFound("Invoice");
    await assertInvoiceAccess(user, sale.customer, sale.cafe);
    const lines = [
      { description: `Book: ${sale.title}${sale.author ? ` — ${sale.author}` : ""}`, quantity: 1, rate: sale.pricePoints, amount: sale.pricePoints },
    ];
    const notes = ["1 point = ₹1. Paid from the membership points wallet."];
    if (sale.status === "RETURNED") {
      const refund = sale.refundPoints ?? 0;
      lines.push({
        description: `Book returned after ${sale.monthsHeld} month(s) — ${sale.deductionPercent}% kept, balance refunded`,
        quantity: 1,
        rate: -refund,
        amount: -refund,
      });
      notes.push(`Returned on ${sale.returnedAt ? new Date(sale.returnedAt).toLocaleDateString("en-IN") : "—"}; ${refund} points refunded.`);
    }
    return {
      kind,
      number: `INV-${sale.saleNumber}`,
      title: "Book Purchase Invoice",
      issuedAt: sale.soldAt as Date,
      status: sale.status,
      currency: "POINTS",
      seller: await sellerFor(sale.cafe),
      billTo: await billTo(sale.customer),
      lines,
      subtotal: sale.pricePoints,
      total: lines.reduce((s, l) => s + l.amount, 0),
      paymentMode: "Membership points wallet",
      notes,
    };
  }

  throw Errors.notFound("Invoice");
}
