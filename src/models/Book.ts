import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

/** A book stocked at a specific cafe that customers can buy (with points) and later return. */
const bookSchema = new Schema(
  {
    cafe: { type: Schema.Types.ObjectId, ref: "Cafe", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, trim: true, maxlength: 120, default: "" },
    isbn: { type: String, trim: true, maxlength: 20 },
    pricePoints: { type: Number, required: true, min: 1, max: 100000 },
    stock: { type: Number, default: 1, min: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
bookSchema.index({ cafe: 1, active: 1, title: 1 });

export type BookDoc = InferSchemaType<typeof bookSchema> & { _id: Types.ObjectId };
export const Book: Model<BookDoc> = (models.Book as Model<BookDoc>) || model<BookDoc>("Book", bookSchema);
