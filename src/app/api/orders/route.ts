import { route, ok } from "@/lib/api";
import { paging, pageMeta, dateRange, escapeRegex } from "@/lib/query";
import { cafeFilter } from "@/services/scope.service";
import { Order, OrderItem, VisitSession } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 20);
    const sp = req.nextUrl.searchParams;
    const cafeId = sp.get("cafeId");
    const status = sp.get("status");
    const q = sp.get("q");

    const scopedFilter = await cafeFilter(user, cafeId || null);

    const match: Record<string, unknown> = {
      ...scopedFilter,
      ...dateRange(req, "createdAt"),
      ...(status ? { status } : {}),
    };
    if (q) {
      match.orderNumber = { $regex: escapeRegex(q), $options: "i" };
    }

    const [orders, total] = await Promise.all([
      Order.find(match)
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code openingHours acceptsPreOrders estimatedPrepMinutes")
        .populate("customer", "name email mobile")
        .lean(),
      Order.countDocuments(match),
    ]);

    const orderIds = orders.map((o) => o._id);
    const customerIds = orders.map((o) => (o.customer as any)?._id || o.customer);

    const [items, activeSessions] = await Promise.all([
      OrderItem.find({ order: { $in: orderIds } }).lean(),
      VisitSession.find({ customer: { $in: customerIds }, status: "ACTIVE" }).select("customer cafe").lean(),
    ]);

    const activeMap = new Map<string, string>();
    for (const s of activeSessions) {
      activeMap.set(String(s.customer), String(s.cafe));
    }

    const itemMap = new Map<string, any[]>();
    for (const it of items) {
      const k = String(it.order);
      if (!itemMap.has(k)) itemMap.set(k, []);
      itemMap.get(k)!.push(it);
    }

    const rows = orders.map((o) => {
      const custId = String((o.customer as any)?._id || o.customer);
      const cafeIdStr = String((o.cafe as any)?._id || o.cafe);
      const customerPresent = activeMap.get(custId) === cafeIdStr;
      return {
        ...o,
        items: itemMap.get(String(o._id)) || [],
        customerPresent,
      };
    });

    return ok(rows, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"], permission: "orders.view" }
);

