import { route, ok } from "@/lib/api";
import { platformDashboard } from "@/services/dashboard.service";

export const GET = route(
  async ({ req }) => {
    const sp = req.nextUrl.searchParams;
    const filters = {
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
      cafeId: sp.get("cafeId") || undefined,
      franchiseId: sp.get("franchiseId") || undefined,
      orderStatus: sp.get("orderStatus") || undefined,
      paymentStatus: sp.get("paymentStatus") || undefined,
    };
    const data = await platformDashboard(filters);
    return ok(data);
  },
  { roles: ["SUPER_ADMIN"], permission: "dashboard.platform" }
);

