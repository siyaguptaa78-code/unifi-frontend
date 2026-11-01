import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { menuItemSchema } from "@/lib/validators";
import { MenuItem } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";

export const GET = route(async ({ params }) => {
  assertObjectId(params.id, "MenuItem");
  const item = await MenuItem.findById(params.id).populate("category", "name slug").lean();
  if (!item) throw Errors.notFound("MenuItem");
  return ok(item);
});

export const PUT = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "MenuItem");
    const input = await parseBody(req, menuItemSchema);
    const item = await MenuItem.findByIdAndUpdate(params.id, input, { new: true });
    if (!item) throw Errors.notFound("MenuItem");
    await logAudit(user, "MENU_ITEM_UPDATED", "MenuItem", item._id, { name: item.name }, { ip });
    return ok(item);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    assertObjectId(params.id, "MenuItem");
    const item = await MenuItem.findByIdAndUpdate(params.id, { active: false }, { new: true });
    if (!item) throw Errors.notFound("MenuItem");
    await logAudit(user, "MENU_ITEM_DEACTIVATED", "MenuItem", item._id, {}, { ip });
    return ok({ message: "Menu item deactivated" });
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

