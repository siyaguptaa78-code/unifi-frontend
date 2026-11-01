import { route, ok, parseBody } from "@/lib/api";
import { refundMembershipPayment } from "@/services/payment.service";
import { z } from "zod";

const refundSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().trim().min(3).max(300),
});

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, refundSchema);
    const result = await refundMembershipPayment(user, input.paymentId, input.reason);
    return ok(result);
  },
  { roles: ["SUPER_ADMIN"], permission: "payments.refund" }
);

