import { route, ok, parseBody } from "@/lib/api";
import { verifyRazorpayCheckout } from "@/services/payment.service";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, verifySchema);
    const result = await verifyRazorpayCheckout(user, input);
    return ok(result);
  },
  { roles: ["CUSTOMER"] }
);

