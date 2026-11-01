import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { menuCategorySchema } from "@/lib/validators";
import { MenuCategory } from "@/models";
import { logAudit } from "@/services/audit.service";
import { Errors } from "@/lib/errors";

export const PUT = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Category");
    const input = await parseBody(req, menuCategorySchema);
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const category = await MenuCategory.findByIdAndUpdate(
      params.id,
      { ...input, slug },
      { new: true }
    );
    if (!category) throw Errors.notFound("Category");

    await logAudit(user, "CATEGORY_UPDATED", "MenuCategory", category._id, { name: category.name }, { ip });
    return ok(category);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    assertObjectId(params.id, "Category");
    const category = await MenuCategory.findByIdAndUpdate(params.id, { active: false }, { new: true });
    if (!category) throw Errors.notFound("Category");

    await logAudit(user, "CATEGORY_DEACTIVATED", "MenuCategory", category._id, {}, { ip });
    return ok({ message: "Category deactivated successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);

