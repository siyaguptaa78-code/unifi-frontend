import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { refundCompletedOrder } from "@/services/order.service";
import { z } from "zod";

const refundOrderSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

export const POST = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Order");
    const input = await parseBody(req, refundOrderSchema);
    const result = await refundCompletedOrder(user, params.id, input.reason, ip);
    return ok(result);
  },
  { roles: ["SUPER_ADMIN"], permission: "orders.refund" }
);

