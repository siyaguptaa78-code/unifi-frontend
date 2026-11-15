import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { cafeSchema } from "@/lib/validators";
import { Cafe } from "@/models";
import { logAudit } from "@/services/audit.service";
import { getSessionUser } from "@/lib/auth/session";
import { getCafeScope } from "@/services/scope.service";
import { CAFE_SCOPED_ROLES } from "@/lib/rbac";

/**
 * Cafe list. Franchise owners, supervisors, managers and staff only ever see the cafes they are
 * assigned to. Public visitors and customers see all open cafes but not staff contact details.
 */
export const GET = publicRoute(async ({ req }) => {
  const status = req.nextUrl.searchParams.get("status");
  const match: Record<string, unknown> = status ? { status } : { status: { $ne: "INACTIVE" } };
  const user = await getSessionUser();
  const internal = user && user.role !== "CUSTOMER";
  if (user && CAFE_SCOPED_ROLES.includes(user.role)) {
    const scope = await getCafeScope(user);
    if (scope) match._id = { $in: scope };
  }
  let q = Cafe.find(match).populate("franchise", "name code").sort({ name: 1 });
  if (internal) {
    q = q.populate("supervisor", "name email").populate("manager", "name email mobile");
  } else {
    q = q.select("-allowedIps -pointsAllocated -pointsHistory -supervisor -manager");
  }
  return ok(await q.lean());
});

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, cafeSchema);
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const cafe = await Cafe.create({
      ...input,
      slug,
      franchise: input.franchise || undefined,
      supervisor: input.supervisor || undefined,
      manager: input.manager || undefined,
    });

    await logAudit(user, "CAFE_CREATED", "Cafe", cafe._id, { name: cafe.name, code: cafe.code }, { cafe: cafe._id, ip });
    return ok(cafe, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "cafes.manage" }
);

