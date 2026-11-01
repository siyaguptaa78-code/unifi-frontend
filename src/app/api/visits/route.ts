import { route, ok } from "@/lib/api";
import { paging, pageMeta, dateRange } from "@/lib/query";
import { cafeFilter } from "@/services/scope.service";
import { VisitSession } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 20);
    const sp = req.nextUrl.searchParams;
    const cafeId = sp.get("cafeId");
    const status = sp.get("status");

    const scopedFilter = await cafeFilter(user, cafeId || null);

    const match: Record<string, unknown> = {
      ...scopedFilter,
      ...dateRange(req, "entryAt"),
      ...(status ? { status } : {}),
    };

    const [visits, total] = await Promise.all([
      VisitSession.find(match)
        .sort({ entryAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code")
        .populate("exitCafe", "name code")
        .populate("customer", "name email mobile")
        .populate("card", "cardNumber uid cardType")
        .lean(),
      VisitSession.countDocuments(match),
    ]);

    return ok(visits, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"], permission: "visits.view" }
);

