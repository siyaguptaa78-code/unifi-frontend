import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { franchiseSchema } from "@/lib/validators";
import { Franchise, Cafe } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";

export const GET = route(async ({ user, params }) => {
  assertObjectId(params.id, "Franchise");
  const franchise = await Franchise.findById(params.id)
    .populate("owner", "name email mobile")
    .populate("supervisor", "name email mobile")
    .populate("package", "name amount cafeSize setupInclusions equipmentInclusions")
    .lean();
  if (!franchise) throw Errors.notFound("Franchise");

  if (user.role === "FRANCHISE_OWNER" && String((franchise.owner as any)?._id || franchise.owner) !== user.id) {
    throw Errors.forbidden("You do not have access to this franchise");
  }

  const cafes = await Cafe.find({ franchise: franchise._id }).populate("manager", "name mobile").lean();
  return ok({ ...franchise, cafes });
});

export const PUT = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Franchise");
    const input = await parseBody(req, franchiseSchema);
    const prev = await Franchise.findById(params.id);
    if (!prev) throw Errors.notFound("Franchise");

    const isApproving = prev.status === "PENDING_APPROVAL" && (input.status === "APPROVED" || input.status === "ACTIVE");

    const franchise = await Franchise.findByIdAndUpdate(
      params.id,
      {
        ...input,
        owner: input.owner || undefined,
        supervisor: input.supervisor || undefined,
        ...(isApproving ? { approvedBy: user.id, approvedAt: new Date() } : {}),
      },
      { new: true }
    );

    await logAudit(user, "FRANCHISE_UPDATED", "Franchise", franchise!._id, { fromStatus: prev.status, toStatus: input.status }, { ip });
    return ok(franchise);
  },
  { roles: ["SUPER_ADMIN"], permission: "franchises.manage" }
);

