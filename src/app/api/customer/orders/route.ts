import { route, ok, parseBody } from "@/lib/api";
import { paging, pageMeta } from "@/lib/query";
import { placeOrderSchema } from "@/lib/validators";
import { placeOrder } from "@/services/order.service";
import { Order, OrderItem } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 15);
    const [orders, total] = await Promise.all([
      Order.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code address openingHours acceptsPreOrders estimatedPrepMinutes")
        .lean(),
      Order.countDocuments({ customer: user.id }),
    ]);

    const orderIds = orders.map((o) => o._id);
    const items = await OrderItem.find({ order: { $in: orderIds } }).lean();
    const itemMap = new Map<string, any[]>();
    for (const it of items) {
      const k = String(it.order);
      if (!itemMap.has(k)) itemMap.set(k, []);
      itemMap.get(k)!.push(it);
    }

    const rows = orders.map((o) => ({
      ...o,
      items: itemMap.get(String(o._id)) || [],
    }));

    return ok(rows, pageMeta(p, total));
  },
  { roles: ["CUSTOMER"] }
);

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, placeOrderSchema);
    const res = await placeOrder(user, input);
    return ok(res, undefined, res.duplicate ? 200 : 201);
  },
  { roles: ["CUSTOMER"] }
);

