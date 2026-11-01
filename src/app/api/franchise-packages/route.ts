import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { franchisePackageSchema } from "@/lib/validators";
import { FranchisePackage } from "@/models";
import { logAudit } from "@/services/audit.service";

export const GET = publicRoute(async () => {
  const packages = await FranchisePackage.find().sort({ amount: 1 }).lean();
  return ok(packages);
});

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, franchisePackageSchema);
    const pkg = await FranchisePackage.create(input);
    await logAudit(user, "FRANCHISE_PACKAGE_CREATED", "FranchisePackage", pkg._id, { name: pkg.name, amount: pkg.amount }, { ip });
    return ok(pkg, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "packages.manage" }
);

