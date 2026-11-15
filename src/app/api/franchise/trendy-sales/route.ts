import { route, ok } from "@/lib/api";
import { Cafe } from "@/models";
import { getCafeScope } from "@/services/scope.service";
import { trendySalesByCafe } from "@/services/trending.service";

/** How well each of the caller's cafes is selling the current Trendy Food items (last 30 days). */
export const GET = route(
  async ({ user }) => {
    const scope = await getCafeScope(user);
    const { trending, rows } = await trendySalesByCafe(scope);
    const cafes = await Cafe.find(scope ? { _id: { $in: scope } } : {})
      .select("name code pointsAllocated pointsHistory")
      .lean();
    const byId = new Map(rows.map((r) => [r.cafe, r]));
    const data = cafes
      .map((c) => ({
        cafeId: String(c._id),
        name: c.name,
        code: c.code,
        trendyQuantity: byId.get(String(c._id))?.quantity ?? 0,
        trendyPoints: byId.get(String(c._id))?.points ?? 0,
        topItems: (byId.get(String(c._id))?.items ?? []).slice(0, 3),
        rewards: (c.pointsHistory ?? []).filter((h) => h.kind === "REWARD").slice(-3).reverse(),
      }))
      .sort((a, b) => b.trendyQuantity - a.trendyQuantity);
    return ok({ trending, cafes: data });
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER"] }
);
