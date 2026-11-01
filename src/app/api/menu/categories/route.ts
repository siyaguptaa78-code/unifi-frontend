import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { menuCategorySchema } from "@/lib/validators";
import { MenuCategory } from "@/models";
import { logAudit } from "@/services/audit.service";

export const GET = publicRoute(async () => {
  const categories = await MenuCategory.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return ok(categories);
});

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, menuCategorySchema);
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await MenuCategory.create({ ...input, slug });
    await logAudit(user, "CATEGORY_CREATED", "MenuCategory", category._id, { name: category.name }, { ip });
    return ok(category, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

