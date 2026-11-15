import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

/**
 * One-time password that confirms a cafe entry or exit. Staff taps the card, the customer
 * receives the code (in-app notification + SMS provider), and staff enters it to complete
 * the visit action. Codes expire after a few minutes and allow a limited number of attempts.
 */
const visitOtpSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    card: { type: Schema.Types.ObjectId, ref: "MembershipCard", required: true },
    cafe: { type: Schema.Types.ObjectId, ref: "Cafe", required: true },
    action: { type: String, enum: ["ENTRY", "EXIT"], required: true },
    codeHash: { type: String, required: true },
    // Plain code is kept only while the OTP is live so the customer app can display it.
    code: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: String,
    attempts: { type: Number, default: 0 },
    status: { type: String, enum: ["PENDING", "USED", "EXPIRED", "LOCKED"], default: "PENDING" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
visitOtpSchema.index({ customer: 1, status: 1, createdAt: -1 });
// Clean up old OTP documents automatically one day after expiry.
visitOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export type VisitOtpDoc = InferSchemaType<typeof visitOtpSchema> & { _id: Types.ObjectId };
export const VisitOtp: Model<VisitOtpDoc> = (models.VisitOtp as Model<VisitOtpDoc>) || model<VisitOtpDoc>("VisitOtp", visitOtpSchema);
