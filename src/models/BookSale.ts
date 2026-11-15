import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

/**
 * A book sold to a customer. On return, part of the price is kept based on how many months the
 * customer had the book (policy in `books.returnDeductions`) and the rest is refunded as points.
 * After the policy period the book can no longer be returned (status stays SOLD — it is theirs).
 */
const bookSaleSchema = new Schema(
  {
    saleNumber: { type: String, required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true },
    author: String,
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cafe: { type: Schema.Types.ObjectId, ref: "Cafe", required: true },
    pricePoints: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["SOLD", "RETURNED"], default: "SOLD" },
    soldBy: { type: Schema.Types.ObjectId, ref: "User" },
    soldAt: { type: Date, default: Date.now },
    returnedAt: Date,
    returnedTo: { type: Schema.Types.ObjectId, ref: "User" },
    returnCafe: { type: Schema.Types.ObjectId, ref: "Cafe" },
    monthsHeld: Number,
    deductionPercent: Number,
    refundPoints: Number,
  },
  { timestamps: true }
);
bookSaleSchema.index({ saleNumber: 1 }, { unique: true });
bookSaleSchema.index({ customer: 1, soldAt: -1 });
bookSaleSchema.index({ cafe: 1, soldAt: -1 });

export type BookSaleDoc = InferSchemaType<typeof bookSaleSchema> & { _id: Types.ObjectId };
export const BookSale: Model<BookSaleDoc> = (models.BookSale as Model<BookSaleDoc>) || model<BookSaleDoc>("BookSale", bookSaleSchema);
