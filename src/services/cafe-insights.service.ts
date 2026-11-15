import { Types } from "mongoose";
import { Cafe } from "@/models/Cafe";
import { Order } from "@/models/Order";
import { PointsLedger } from "@/models/PointsLedger";
import { VisitSession } from "@/models/VisitSession";
import { Staff } from "@/models/Staff";
import { Errors } from "@/lib/errors";
import { assertCafeAccess } from "@/services/scope.service";
import { notify } from "@/services/notification.service";
import { logAudit } from "@/services/audit.service";
import { getTrending } from "@/services/trending.service";
import type { AuthUser } from "@/lib/auth/session";

/**
 * Points used at each cafe = points customers spent there (order + book debits) minus refunds,
 * taken from the immutable points ledger.
 */
export async function pointsUsedByCafe(cafeIds: Types.ObjectId[] | null, since?: Date) {
  const match: Record<string, unknown> = { type: { $in: ["DEBIT", "REFUND"] }, cafe: cafeIds ? { $in: cafeIds } : { $exists: true, $ne: null } };
  if (since) match.createdAt = { $gte: since };
  const rows = await PointsLedger.aggregate<{ _id: Types.ObjectId; used: number }>([
    { $match: match },
    { $group: { _id: "$cafe", used: { $sum: { $multiply: ["$points", -1] } } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), Math.max(0, r.used)]));
}

/** Branch-wise points table for the Super Admin. */
export async function branchPointsSummary() {
  const cafes = await Cafe.find().select("name code status pointsAllocated pointsHistory allowedIps address.city").sort({ name: 1 }).lean();
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [used, used30] = await Promise.all([pointsUsedByCafe(null), pointsUsedByCafe(null, monthAgo)]);
  return cafes.map((c) => {
    const u = used.get(String(c._id)) ?? 0;
    return {
      _id: c._id,
      name: c.name,
      code: c.code,
      status: c.status,
      city: c.address?.city,
      pointsAllocated: c.pointsAllocated ?? 0,
      pointsUsed: u,
      pointsUsed30d: used30.get(String(c._id)) ?? 0,
      pointsRemaining: (c.pointsAllocated ?? 0) - u,
      history: (c.pointsHistory ?? []).slice(-10).reverse(),
      allowedIps: c.allowedIps ?? [],
    };
  });
}

/** Adds (or with a negative value, removes) points from a cafe's budget. kind=REWARD for franchise rewards. */
export async function adjustCafePoints(actor: AuthUser, cafeId: string, points: number, note: string, kind: "ALLOCATION" | "REWARD") {
  await assertCafeAccess(actor, cafeId);
  if (!Number.isInteger(points) || points === 0) throw Errors.badRequest("Enter a non-zero whole number of points");
  if (kind === "REWARD" && points < 0) throw Errors.badRequest("Rewards must be positive");
  const filter: Record<string, unknown> = { _id: cafeId };
  if (points < 0) filter.pointsAllocated = { $gte: -points };
  const cafe = await Cafe.findOneAndUpdate(
    filter,
    { $inc: { pointsAllocated: points }, $push: { pointsHistory: { points, note, kind, by: new Types.ObjectId(actor.id), at: new Date() } } },
    { new: true }
  ).lean();
  if (!cafe) {
    if (!(await Cafe.exists({ _id: cafeId }))) throw Errors.notFound("Cafe");
    throw Errors.business("INSUFFICIENT_ALLOCATION", "Cannot remove more points than are allocated to this cafe");
  }
  await logAudit(actor, kind === "REWARD" ? "CAFE_REWARD_GIVEN" : "CAFE_POINTS_ALLOCATED", "Cafe", cafeId, { points, note }, { cafe: cafeId });
  if (kind === "REWARD") {
    const managers = await Staff.find({ cafes: cafe._id, position: "MANAGER", status: "ACTIVE" }).select("user").lean();
    await Promise.all(
      managers.map((m) =>
        notify(m.user, "CAFE_REWARD", "Your cafe earned a reward", `${cafe.name} received ${points} reward points: ${note}`, { link: "/manager/dashboard" })
      )
    );
  }
  return cafe;
}

export async function setCafeAllowedIps(actor: AuthUser, cafeId: string, ips: string[]) {
  const clean = [...new Set(ips.map((i) => i.trim()).filter(Boolean))];
  for (const ip of clean) {
    if (!/^[0-9a-fA-F:.*]+$/.test(ip)) throw Errors.badRequest(`"${ip}" is not a valid IP address or pattern`);
  }
  const cafe = await Cafe.findByIdAndUpdate(cafeId, { $set: { allowedIps: clean } }, { new: true }).lean();
  if (!cafe) throw Errors.notFound("Cafe");
  await logAudit(actor, "CAFE_LOGIN_IPS_UPDATED", "Cafe", cafeId, { allowedIps: clean }, { cafe: cafeId });
  return cafe;
}

/** Everything shown behind the "eye" button for one location. */
export async function cafeOverview(user: AuthUser, cafeId: string) {
  if (!Types.ObjectId.isValid(cafeId)) throw Errors.notFound("Cafe");
  await assertCafeAccess(user, cafeId);
  const cid = new Types.ObjectId(cafeId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [cafe, todayOrders, monthOrders, pendingOrders, activeVisitors, monthVisits, staff, used, used30, trending] = await Promise.all([
    Cafe.findById(cid).populate("franchise", "name code").populate("manager", "name email mobile").populate("supervisor", "name").lean(),
    Order.countDocuments({ cafe: cid, createdAt: { $gte: startOfToday } }),
    Order.aggregate([
      { $match: { cafe: cid, createdAt: { $gte: monthAgo }, status: { $nin: ["CANCELLED", "REFUNDED"] } } },
      { $group: { _id: null, count: { $sum: 1 }, points: { $sum: "$totalPoints" } } },
    ]),
    Order.countDocuments({ cafe: cid, status: { $in: ["PENDING", "ACCEPTED", "PREPARING", "READY"] } }),
    VisitSession.countDocuments({ cafe: cid, status: "ACTIVE" }),
    VisitSession.countDocuments({ cafe: cid, entryAt: { $gte: monthAgo } }),
    Staff.find({ cafes: cid, status: "ACTIVE" }).populate("user", "name mobile").select("user position designation").lean(),
    pointsUsedByCafe([cid]),
    pointsUsedByCafe([cid], monthAgo),
    getTrending(cafeId),
  ]);
  if (!cafe) throw Errors.notFound("Cafe");
  return {
    cafe,
    stats: {
      todayOrders,
      pendingOrders,
      orders30d: monthOrders[0]?.count ?? 0,
      orderPoints30d: monthOrders[0]?.points ?? 0,
      activeVisitors,
      visits30d: monthVisits,
      pointsAllocated: cafe.pointsAllocated ?? 0,
      pointsUsed: used.get(cafeId) ?? 0,
      pointsUsed30d: used30.get(cafeId) ?? 0,
    },
    staff: staff.map((s) => ({ name: (s.user as any)?.name, mobile: (s.user as any)?.mobile, position: s.position, designation: s.designation })),
    trending: trending.slice(0, 5),
    rewards: (cafe.pointsHistory ?? []).filter((h) => h.kind === "REWARD").slice(-5).reverse(),
  };
}

