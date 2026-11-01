import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { cafeSchema } from "@/lib/validators";
import { Cafe } from "@/models";
import { logAudit } from "@/services/audit.service";

export const GET = publicRoute(async ({ req }) => {
  const status = req.nextUrl.searchParams.get("status");
  const match = status ? { status } : { status: { $ne: "INACTIVE" } };
  const cafes = await Cafe.find(match)
    .populate("franchise", "name code")
    .populate("supervisor", "name email")
    .populate("manager", "name email mobile")
    .sort({ name: 1 })
    .lean();
  return ok(cafes);
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

