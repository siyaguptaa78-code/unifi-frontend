import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { orderStatusUpdateSchema } from "@/lib/validators";
import { updateOrderStatus, getOrderDetail } from "@/services/order.service";
import { assertCafeAccess } from "@/services/scope.service";

export const GET = route(
  async ({ user, params }) => {
    assertObjectId(params.id, "Order");
    const detail = await getOrderDetail(params.id);
    await assertCafeAccess(user, (detail.cafe as any)?._id || detail.cafe);
    return ok(detail);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"], permission: "orders.view" }
);

export const PATCH = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Order");
    const input = await parseBody(req, orderStatusUpdateSchema);
    const updated = await updateOrderStatus(user, params.id, input.status, input.reason, ip);
    return ok(updated);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "orders.update" }
);

