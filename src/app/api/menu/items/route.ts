import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { menuItemSchema, localItemRequestSchema } from "@/lib/validators";
import { assertCafeAccess } from "@/services/scope.service";
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
    // Cafe managers / franchise owners create items for their own cafe; they are live there immediately.
    if (user.role !== "SUPER_ADMIN") {
      const input = await parseBody(req, localItemRequestSchema);
      await assertCafeAccess(user, input.cafeId);
      const { cafeId, ...fields } = input;
      const item = await MenuItem.create({
        ...fields,
        scope: "LOCAL",
        cafe: cafeId,
        approvalStatus: "APPROVED",
        createdBy: user.id,
      });
      await logAudit(user, "MENU_LOCAL_ITEM_CREATED", "MenuItem", item._id, { name: item.name, points: item.pointsPrice }, { cafe: cafeId, ip });
      return ok(item, undefined, 201);
    }
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
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER", "MANAGER"] }
);

