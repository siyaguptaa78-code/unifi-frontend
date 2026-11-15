import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { cafeSchema } from "@/lib/validators";
import { Cafe } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";
import { assertCafeAccess } from "@/services/scope.service";
import { CAFE_SCOPED_ROLES } from "@/lib/rbac";

export const GET = route(async ({ params, user }) => {
  assertObjectId(params.id, "Cafe");
  if (CAFE_SCOPED_ROLES.includes(user.role)) await assertCafeAccess(user, params.id);
  const cafe = await Cafe.findById(params.id)
    .populate("franchise", "name code")
    .populate("supervisor", "name email mobile")
    .populate("manager", "name email mobile")
    .lean();
  if (!cafe) throw Errors.notFound("Cafe");
  return ok(cafe);
});

export const PUT = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Cafe");
    const input = await parseBody(req, cafeSchema);
    const cafe = await Cafe.findByIdAndUpdate(
      params.id,
      {
        ...input,
        franchise: input.franchise || undefined,
        supervisor: input.supervisor || undefined,
        manager: input.manager || undefined,
      },
      { new: true }
    );
    if (!cafe) throw Errors.notFound("Cafe");
    await logAudit(user, "CAFE_UPDATED", "Cafe", cafe._id, { name: cafe.name }, { cafe: cafe._id, ip });
    return ok(cafe);
  },
  { roles: ["SUPER_ADMIN"], permission: "cafes.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    assertObjectId(params.id, "Cafe");
    const cafe = await Cafe.findByIdAndUpdate(params.id, { status: "INACTIVE" }, { new: true });
    if (!cafe) throw Errors.notFound("Cafe");
    await logAudit(user, "CAFE_DEACTIVATED", "Cafe", cafe._id, {}, { cafe: cafe._id, ip });
    return ok({ message: "Cafe marked as inactive" });
  },
  { roles: ["SUPER_ADMIN"], permission: "cafes.manage" }
);

