import { route, ok } from "@/lib/api";
import { createMembershipPaymentOrder } from "@/services/payment.service";
import { z } from "zod";

const bodySchema = z.object({ amount: z.coerce.number().int().positive().optional() }).default({});

export const POST = route(
  async ({ req, user }) => {
    // Body is optional for backwards compatibility (no body = default plan).
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const input = bodySchema.parse(body ?? {});
    const orderData = await createMembershipPaymentOrder(user, input.amount);
    return ok(orderData);
  },
  { roles: ["CUSTOMER"] }
);
