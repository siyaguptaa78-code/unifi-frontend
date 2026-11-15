import { Types } from "mongoose";
import { route, ok, parseBody } from "@/lib/api";
import { adminBroadcastNotificationSchema } from "@/lib/validators";
import { Errors } from "@/lib/errors";
import { User, Notification, Cafe, CustomerProfile, VisitSession, Order } from "@/models";
import { logAudit } from "@/services/audit.service";
import { escapeRegex } from "@/lib/query";

/** Customers linked to any of these cafes: preferred cafe, visited, or ordered there. */
async function customersOfCafes(cafeIds: Types.ObjectId[]) {
  const [prefs, visitors, buyers] = await Promise.all([
    CustomerProfile.distinct("user", { preferredCafe: { $in: cafeIds } }),
    VisitSession.distinct("customer", { cafe: { $in: cafeIds } }),
    Order.distinct("customer", { cafe: { $in: cafeIds } }),
  ]);
  const ids = new Set([...prefs, ...visitors, ...buyers].map(String));
  return [...ids].map((id) => new Types.ObjectId(id));
}

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, adminBroadcastNotificationSchema);
    const { target } = input;

    let cafeIds: Types.ObjectId[] | null = null;
    if (target.scope === "AREA") {
      if (!target.areas.length) throw Errors.badRequest("Select at least one city / area");
      const rx = target.areas.map((a) => new RegExp(`^${escapeRegex(a)}$`, "i"));
      const cafes = await Cafe.find({ $or: [{ "address.city": { $in: rx } }, { "address.area": { $in: rx } }] }).select("_id").lean();
      cafeIds = cafes.map((c) => c._id);
    } else if (target.scope === "CAFES") {
      if (!target.cafeIds.length) throw Errors.badRequest("Select at least one cafe");
      cafeIds = target.cafeIds.map((id) => new Types.ObjectId(id));
    }

    const match: Record<string, unknown> = { role: "CUSTOMER", status: "ACTIVE" };
    if (cafeIds) match._id = { $in: await customersOfCafes(cafeIds) };
    const customers = await User.find(match).select("_id").lean();

    if (customers.length > 0) {
      await Notification.insertMany(
        customers.map((c) => ({
          user: c._id,
          type: input.type === "OFFER" ? "PROMOTION" : "SYSTEM",
          title: input.title,
          message: input.message,
          link: input.link || "/customer/dashboard",
          read: false,
          channels: ["IN_APP"],
        }))
      );
    }

    const audience =
      target.scope === "ALL" ? "all cafes" : target.scope === "AREA" ? `area: ${target.areas.join(", ")}` : `${target.cafeIds.length} selected cafe(s)`;
    await logAudit(user, "NOTIFICATION_BROADCAST", "Notification", user.id, { title: input.title, audience, recipientsCount: customers.length }, { ip });

    return ok({
      success: true,
      recipientsCount: customers.length,
      message: `Broadcast delivered to ${customers.length} member(s) (${audience}).`,
    });
  },
  { roles: ["SUPER_ADMIN"], permission: "notifications.broadcast" }
);
