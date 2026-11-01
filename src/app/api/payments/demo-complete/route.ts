import { route, ok, parseBody } from "@/lib/api";
import { completeDemoPayment } from "@/services/payment.service";
import { z } from "zod";

const demoSchema = z.object({
  paymentId: z.string().min(1),
  outcome: z.enum(["SUCCESS", "FAILED"]),
});

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, demoSchema);
    const result = await completeDemoPayment(user, input.paymentId, input.outcome);
    return ok(result);
  },
  { roles: ["CUSTOMER"] }
);

