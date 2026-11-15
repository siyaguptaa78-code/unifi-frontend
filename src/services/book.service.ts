import { Types } from "mongoose";
import { Book } from "@/models/Book";
import { BookSale } from "@/models/BookSale";
import { MembershipCard } from "@/models/MembershipCard";
import { Errors } from "@/lib/errors";
import { withTransaction } from "@/lib/db";
import { makeReference } from "@/lib/ids";
import { assertCafeAccess, cafeFilter } from "@/services/scope.service";
import { creditPoints, debitPoints } from "@/services/wallet.service";
import { getBookReturnDeductions } from "@/services/settings.service";
import { notify } from "@/services/notification.service";
import { logAudit } from "@/services/audit.service";
import { normalizeUid } from "@/services/card.service";
import type { AuthUser } from "@/lib/auth/session";

const DAY = 86400000;

/** Month the customer is in since purchase: day 0–30 → 1, day 31–60 → 2, … */
export function monthsHeld(soldAt: Date, now = new Date()) {
  return Math.floor(Math.max(0, now.getTime() - soldAt.getTime()) / (30 * DAY)) + 1;
}

/** Return quote for a sale under the current policy. */
export function quoteReturn(pricePoints: number, soldAt: Date, deductions: number[], now = new Date()) {
  const month = monthsHeld(soldAt, now);
  if (month > deductions.length) {
    return { returnable: false as const, month, deductionPercent: 100, refundPoints: 0 };
  }
  const deductionPercent = deductions[month - 1];
  const refundPoints = Math.floor((pricePoints * (100 - deductionPercent)) / 100);
  return { returnable: true as const, month, deductionPercent, refundPoints };
}

export type BookInput = { cafeId: string; title: string; author?: string; isbn?: string; pricePoints: number; stock: number; active?: boolean };

export async function listBooks(user: AuthUser, cafeId?: string | null) {
  // Customers can browse any cafe's shelf; staff are limited to their scope.
  const filter: Record<string, unknown> =
    user.role === "CUSTOMER" ? (cafeId ? { cafe: new Types.ObjectId(cafeId), active: true } : { active: true }) : await cafeFilter(user, cafeId || null);
  return Book.find(filter).populate("cafe", "name code").sort({ title: 1 }).limit(500).lean();
}

export async function createBook(actor: AuthUser, input: BookInput) {
  await assertCafeAccess(actor, input.cafeId);
  const book = await Book.create({
    cafe: input.cafeId,
    title: input.title,
    author: input.author ?? "",
    isbn: input.isbn,
    pricePoints: input.pricePoints,
    stock: input.stock,
    active: input.active ?? true,
    createdBy: actor.id,
  });
  await logAudit(actor, "BOOK_CREATED", "Book", book._id, { title: book.title, price: book.pricePoints }, { cafe: input.cafeId });
  return book;
}

export async function updateBook(actor: AuthUser, bookId: string, input: Partial<BookInput>) {
  const book = await Book.findById(bookId);
  if (!book) throw Errors.notFound("Book");
  await assertCafeAccess(actor, book.cafe);
  if (input.title !== undefined) book.title = input.title;
  if (input.author !== undefined) book.author = input.author;
  if (input.isbn !== undefined) book.isbn = input.isbn;
  if (input.pricePoints !== undefined) book.pricePoints = input.pricePoints;
  if (input.stock !== undefined) book.stock = input.stock;
  if (input.active !== undefined) book.active = input.active;
  await book.save();
  await logAudit(actor, "BOOK_UPDATED", "Book", book._id, input as Record<string, unknown>, { cafe: book.cafe });
  return book;
}

/** Sells a book to the customer holding `uid`, paid from their points wallet. */
export async function sellBook(actor: AuthUser, bookId: string, uid: string) {
  const book = await Book.findById(bookId).lean();
  if (!book || !book.active) throw Errors.notFound("Book");
  await assertCafeAccess(actor, book.cafe);
  const card = await MembershipCard.findOne({ uid: normalizeUid(uid) }).lean();
  if (!card) throw Errors.business("CARD_NOT_FOUND", "Card not recognised.");
  if (card.status !== "ACTIVE") throw Errors.business("CARD_NOT_ACTIVE", `Card is ${card.status.toLowerCase()}.`);

  const sale = await withTransaction(async (session) => {
    const o = session ? { session } : {};
    const taken = await Book.findOneAndUpdate({ _id: book._id, stock: { $gt: 0 } }, { $inc: { stock: -1 } }, { new: true, ...o });
    if (!taken) throw Errors.business("OUT_OF_STOCK", "This book is out of stock.");
    const [created] = await BookSale.create(
      [
        {
          saleNumber: makeReference("BK"),
          book: book._id,
          title: book.title,
          author: book.author,
          customer: card.customer,
          cafe: book.cafe,
          pricePoints: book.pricePoints,
          soldBy: actor.id,
          soldAt: new Date(),
        },
      ],
      o
    );
    try {
      await debitPoints({
        customerId: card.customer,
        points: book.pricePoints,
        source: "BOOK",
        refModel: "BookSale",
        refId: created._id,
        reference: created.saleNumber,
        description: `Book purchase: ${book.title}`,
        cafe: book.cafe,
        performedBy: actor.id,
        session,
      });
    } catch (e) {
      if (!session) {
        // No transactions available: undo the sale and stock change by hand.
        await BookSale.deleteOne({ _id: created._id });
        await Book.updateOne({ _id: book._id }, { $inc: { stock: 1 } });
      }
      throw e;
    }
    return created;
  });

  await notify(card.customer, "BOOK", "Book purchased", `You bought "${book.title}" for ${book.pricePoints} points. Return it within the policy period for a partial refund.`, {
    link: "/customer/books",
  });
  await logAudit(actor, "BOOK_SOLD", "BookSale", sale._id, { title: book.title, price: book.pricePoints }, { cafe: book.cafe });
  return sale.toObject();
}

export async function returnBook(actor: AuthUser, saleId: string) {
  const sale = await BookSale.findById(saleId).lean();
  if (!sale) throw Errors.notFound("Book sale");
  await assertCafeAccess(actor, sale.cafe);
  if (sale.status === "RETURNED") throw Errors.conflict("This book was already returned");
  const deductions = await getBookReturnDeductions();
  const now = new Date();
  const q = quoteReturn(sale.pricePoints, sale.soldAt as Date, deductions, now);
  if (!q.returnable) {
    throw Errors.business("RETURN_WINDOW_CLOSED", `Returns are accepted only within ${deductions.length} months. This book now belongs to the customer.`);
  }

  const updated = await withTransaction(async (session) => {
    const o = session ? { session } : {};
    const done = await BookSale.findOneAndUpdate(
      { _id: sale._id, status: "SOLD" },
      {
        $set: {
          status: "RETURNED",
          returnedAt: now,
          returnedTo: actor.id,
          returnCafe: sale.cafe,
          monthsHeld: q.month,
          deductionPercent: q.deductionPercent,
          refundPoints: q.refundPoints,
        },
      },
      { new: true, ...o }
    );
    if (!done) throw Errors.conflict("This book was already returned");
    if (q.refundPoints > 0) {
      await creditPoints({
        customerId: sale.customer,
        points: q.refundPoints,
        source: "BOOK_REFUND",
        refModel: "BookSale",
        refId: sale._id,
        reference: `RET-${sale.saleNumber}`,
        description: `Book return: ${sale.title} (${q.deductionPercent}% kept)`,
        cafe: sale.cafe,
        performedBy: actor.id,
        session,
        allowInactive: true,
      });
    }
    await Book.updateOne({ _id: sale.book }, { $inc: { stock: 1 } }, o);
    return done;
  });

  await notify(
    sale.customer,
    "BOOK",
    "Book return processed",
    `"${sale.title}" returned in month ${q.month}. ${q.deductionPercent}% kept, ${q.refundPoints} points refunded to your wallet.`,
    { link: "/customer/books" }
  );
  await logAudit(actor, "BOOK_RETURNED", "BookSale", sale._id, { ...q }, { cafe: sale.cafe });
  return updated!.toObject();
}

/** Sales list with live return quotes. Customers see their own; staff their cafes. */
export async function listBookSales(user: AuthUser, opts: { cafeId?: string | null; uid?: string | null } = {}) {
  let filter: Record<string, unknown>;
  if (user.role === "CUSTOMER") {
    filter = { customer: new Types.ObjectId(user.id) };
  } else {
    filter = await cafeFilter(user, opts.cafeId || null);
    if (opts.uid) {
      const card = await MembershipCard.findOne({ uid: normalizeUid(opts.uid) }).select("customer").lean();
      filter.customer = card?.customer ?? new Types.ObjectId();
    }
  }
  const [rows, deductions] = await Promise.all([
    BookSale.find(filter).populate("cafe", "name code").populate("customer", "name mobile").sort({ soldAt: -1 }).limit(300).lean(),
    getBookReturnDeductions(),
  ]);
  return {
    policy: deductions,
    sales: rows.map((s) => ({ ...s, quote: s.status === "SOLD" ? quoteReturn(s.pricePoints, s.soldAt as Date, deductions) : null })),
  };
}
