import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { franchisePackageSchema } from "@/lib/validators";
import { FranchisePackage } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";

export const GET = route(async ({ params }) => {
  assertObjectId(params.id, "FranchisePackage");
  const pkg = await FranchisePackage.findById(params.id).lean();
  if (!pkg) throw Errors.notFound("FranchisePackage");
  return ok(pkg);
});

export const PUT = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "FranchisePackage");
    const input = await parseBody(req, franchisePackageSchema);
    const pkg = await FranchisePackage.findByIdAndUpdate(params.id, input, { new: true });
    if (!pkg) throw Errors.notFound("FranchisePackage");
    await logAudit(user, "FRANCHISE_PACKAGE_UPDATED", "FranchisePackage", pkg._id, { name: pkg.name }, { ip });
    return ok(pkg);
  },
  { roles: ["SUPER_ADMIN"], permission: "packages.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    assertObjectId(params.id, "FranchisePackage");
    const pkg = await FranchisePackage.findByIdAndUpdate(params.id, { status: "INACTIVE" }, { new: true });
    if (!pkg) throw Errors.notFound("FranchisePackage");
    await logAudit(user, "FRANCHISE_PACKAGE_DEACTIVATED", "FranchisePackage", pkg._id, {}, { ip });
    return ok({ message: "Franchise package deactivated" });
  },
  { roles: ["SUPER_ADMIN"], permission: "packages.manage" }
);

