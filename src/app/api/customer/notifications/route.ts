import { route, ok, parseBody } from "@/lib/api";
import { Notification } from "@/models";
import { z } from "zod";

export const GET = route(
  async ({ user }) => {
    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ user: user.id, read: false });
    return ok({ notifications, unreadCount });
  },
  { roles: ["CUSTOMER"] }
);

const markReadSchema = z.object({
  notificationId: z.string().optional(),
  all: z.boolean().optional(),
});

export const PATCH = route(
  async ({ req, user }) => {
    const body = await parseBody(req, markReadSchema);
    if (body.all) {
      await Notification.updateMany({ user: user.id, read: false }, { $set: { read: true, readAt: new Date() } });
      return ok({ message: "All notifications marked as read" });
    }
    if (body.notificationId) {
      await Notification.updateOne({ _id: body.notificationId, user: user.id }, { $set: { read: true, readAt: new Date() } });
      return ok({ message: "Notification marked as read" });
    }
    return ok({ message: "No action performed" });
  },
  { roles: ["CUSTOMER"] }
);

