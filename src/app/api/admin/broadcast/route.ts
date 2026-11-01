import { route, ok, parseBody } from "@/lib/api";
import { adminBroadcastNotificationSchema } from "@/lib/validators";
import { User, Notification } from "@/models";
import { logAudit } from "@/services/audit.service";

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, adminBroadcastNotificationSchema);

    // Find all active customers
    const customers = await User.find({ role: "CUSTOMER", status: "ACTIVE" }).select("_id").lean();

    if (customers.length > 0) {
      const docs = customers.map((c) => ({
        user: c._id,
        type: input.type === "OFFER" ? "PROMOTION" : "SYSTEM",
        title: input.title,
        message: input.message,
        link: input.link || "/customer/dashboard",
        read: false,
        channels: ["IN_APP"],
      }));

      await Notification.insertMany(docs);
    }

    await logAudit(
      user,
      "NOTIFICATION_BROADCAST",
      "Notification",
      user.id,
      { title: input.title, recipientsCount: customers.length },
      { ip }
    );

    return ok({
      success: true,
      recipientsCount: customers.length,
      message: `Broadcast delivered to ${customers.length} active members.`,
    });
  },
  { roles: ["SUPER_ADMIN"], permission: "notifications.broadcast" }
);

