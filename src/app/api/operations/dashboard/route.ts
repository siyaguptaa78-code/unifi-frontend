import { route, ok } from "@/lib/api";
import { operationsDashboard } from "@/services/dashboard.service";

export const GET = route(
  async ({ req, user }) => {
    const sp = req.nextUrl.searchParams;
    const filters = {
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
      cafeId: sp.get("cafeId") || undefined,
    };
    const data = await operationsDashboard(user, filters);
    return ok(data);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"], permission: "dashboard.operations" }
);

