import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { customerCancelOrder, getOrderDetail } from "@/services/order.service";
import { Errors } from "@/lib/errors";
import { z } from "zod";

export const GET = route(
  async ({ user, params }) => {
    const orderId = params.id;
    assertObjectId(orderId, "Order");
    const detail = await getOrderDetail(orderId);
    if (String((detail.customer as any)._id || detail.customer) !== user.id) {
      throw Errors.forbidden("You do not have access to this order");
    }
    return ok(detail);
  },
  { roles: ["CUSTOMER"] }
);

const cancelSchema = z.object({
  reason: z.string().trim().min(3).max(300).default("Cancelled by customer"),
});

export const DELETE = route(
  async ({ req, user, params }) => {
    const orderId = params.id;
    assertObjectId(orderId, "Order");
    const body = await parseBody(req, cancelSchema);
    const updated = await customerCancelOrder(user, orderId, body.reason);
    return ok(updated);
  },
  { roles: ["CUSTOMER"] }
);

