import { route, ok } from "@/lib/api";
import { paging, pageMeta, dateRange } from "@/lib/query";
import { cafeFilter } from "@/services/scope.service";
import { VisitSession, Order } from "@/models";

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

    // For customers currently inside, find their latest order at that cafe during this visit so
    // staff can see "last order X min ago" or "no order yet — seated X min".
    const activeVisits = visits.filter((v) => v.status === "ACTIVE");
    const lastOrders = activeVisits.length
      ? await Order.aggregate([
          {
            $match: {
              $or: activeVisits.map((v) => ({
                customer: (v.customer as any)?._id ?? v.customer,
                cafe: (v.cafe as any)?._id ?? v.cafe,
                createdAt: { $gte: v.entryAt },
              })),
              status: { $nin: ["CANCELLED"] },
            },
          },
          { $group: { _id: { customer: "$customer", cafe: "$cafe" }, lastOrderAt: { $max: "$createdAt" }, orders: { $sum: 1 } } },
        ])
      : [];
    const lastMap = new Map(lastOrders.map((r) => [`${r._id.customer}:${r._id.cafe}`, r]));
    const rows = visits.map((v) => {
      if (v.status !== "ACTIVE") return v;
      const key = `${String((v.customer as any)?._id ?? v.customer)}:${String((v.cafe as any)?._id ?? v.cafe)}`;
      const lo = lastMap.get(key);
      return { ...v, lastOrderAt: lo?.lastOrderAt ?? null, ordersThisVisit: lo?.orders ?? 0 };
    });

    return ok(rows, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"], permission: "visits.view" }
);

