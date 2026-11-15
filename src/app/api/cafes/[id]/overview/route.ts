import { route, ok } from "@/lib/api";
import { cafeOverview } from "@/services/cafe-insights.service";

export const GET = route<{ id: string }>(async ({ user, params }) => ok(await cafeOverview(user, params.id)), {
  roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER"],
});
