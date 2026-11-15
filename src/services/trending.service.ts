import { Types, type PipelineStage } from "mongoose";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { getSetting } from "@/services/settings.service";

export type TrendingItem = { menuItemId: string; name: string; quantity: number; orders: number; pinned: boolean };

async function windowStart() {
  const days = Math.max(1, Number(await getSetting("trending.windowDays")) || 30);
  return new Date(Date.now() - days * 86400000);
}

/** Item sales (quantity + order count) over the trending window, optionally for some cafes. */
export async function itemSales(cafeIds?: Types.ObjectId[] | null, itemIds?: Types.ObjectId[]) {
  const match: Record<string, unknown> = { createdAt: { $gte: await windowStart() }, status: { $nin: ["CANCELLED", "REFUNDED"] } };
  if (cafeIds) match.cafe = { $in: cafeIds };
  const pipeline: PipelineStage[] = [
    { $match: match },
    { $lookup: { from: "orderitems", localField: "_id", foreignField: "order", as: "items" } },
    { $unwind: "$items" },
    ...(itemIds ? [{ $match: { "items.menuItem": { $in: itemIds } } } as PipelineStage] : []),
    {
      $group: {
        _id: { cafe: "$cafe", item: "$items.menuItem" },
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        points: { $sum: "$items.lineTotal" },
        orders: { $sum: 1 },
      },
    },
  ];
  return Order.aggregate<{ _id: { cafe: Types.ObjectId; item: Types.ObjectId }; name: string; quantity: number; points: number; orders: number }>(pipeline);
}

/**
 * Trendy Food: pinned items first, then the most-ordered items in the window, excluding items
 * the Super Admin hid. With `cafeId`, ranking uses that cafe's orders only.
 */
export async function getTrending(cafeId?: string | null): Promise<TrendingItem[]> {
  const limit = Math.max(1, Number(await getSetting("trending.limit")) || 6);
  const cafes = cafeId && Types.ObjectId.isValid(cafeId) ? [new Types.ObjectId(cafeId)] : null;
  const [sales, overrides] = await Promise.all([
    itemSales(cafes),
    MenuItem.find({ trendingMode: { $in: ["PINNED", "HIDDEN"] }, active: true }).select("name trendingMode").lean(),
  ]);
  const totals = new Map<string, { name: string; quantity: number; orders: number }>();
  for (const s of sales) {
    const k = String(s._id.item);
    const t = totals.get(k) ?? { name: s.name, quantity: 0, orders: 0 };
    t.quantity += s.quantity;
    t.orders += s.orders;
    totals.set(k, t);
  }
  const hidden = new Set(overrides.filter((o) => o.trendingMode === "HIDDEN").map((o) => String(o._id)));
  const pinned: TrendingItem[] = overrides
    .filter((o) => o.trendingMode === "PINNED")
    .map((o) => ({ menuItemId: String(o._id), name: o.name, quantity: totals.get(String(o._id))?.quantity ?? 0, orders: totals.get(String(o._id))?.orders ?? 0, pinned: true }));
  const pinnedIds = new Set(pinned.map((p) => p.menuItemId));
  const ranked: TrendingItem[] = [...totals.entries()]
    .filter(([id]) => !hidden.has(id) && !pinnedIds.has(id))
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .map(([id, t]) => ({ menuItemId: id, name: t.name, quantity: t.quantity, orders: t.orders, pinned: false }));
  return [...pinned, ...ranked].slice(0, Math.max(limit, pinned.length));
}

/** Per-cafe sales of the current (network-wide) Trendy Food items — used for franchise rewards. */
export async function trendySalesByCafe(cafeIds: Types.ObjectId[] | null) {
  const trending = await getTrending(null);
  const ids = trending.map((t) => new Types.ObjectId(t.menuItemId));
  if (!ids.length) return { trending, rows: [] as { cafe: string; quantity: number; points: number; items: { name: string; quantity: number }[] }[] };
  const sales = await itemSales(cafeIds, ids);
  const byCafe = new Map<string, { cafe: string; quantity: number; points: number; items: { name: string; quantity: number }[] }>();
  for (const s of sales) {
    const k = String(s._id.cafe);
    const row = byCafe.get(k) ?? { cafe: k, quantity: 0, points: 0, items: [] };
    row.quantity += s.quantity;
    row.points += s.points;
    row.items.push({ name: s.name, quantity: s.quantity });
    byCafe.set(k, row);
  }
  const rows = [...byCafe.values()].sort((a, b) => b.quantity - a.quantity);
  rows.forEach((r) => r.items.sort((a, b) => b.quantity - a.quantity));
  return { trending, rows };
}
