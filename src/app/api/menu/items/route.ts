import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { menuItemSchema } from "@/lib/validators";
import { MenuItem } from "@/models";
import { logAudit } from "@/services/audit.service";

export const GET = publicRoute(async ({ req }) => {
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const match: Record<string, unknown> = { active: true, approvalStatus: "APPROVED" };
  if (categoryId) match.category = categoryId;
  const items = await MenuItem.find(match).populate("category", "name slug").sort({ name: 1 }).lean();
  return ok(items);
});

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, menuItemSchema);
    const item = await MenuItem.create({
      ...input,
      scope: "CENTRAL",
      approvalStatus: "APPROVED",
      createdBy: user.id,
    });
    await logAudit(user, "MENU_ITEM_CREATED", "MenuItem", item._id, { name: item.name, points: item.pointsPrice }, { ip });
    return ok(item, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

