import { route, ok } from "@/lib/api";
import { branchPointsSummary } from "@/services/cafe-insights.service";

export const GET = route(async () => ok(await branchPointsSummary()), { roles: ["SUPER_ADMIN"], permission: "cafes.manage" });
