import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { MenuItem } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";

const schema = z.object({ mode: z.enum(["AUTO", "PINNED", "HIDDEN"]) });

/** Super Admin manual control of Trendy Food: pin (always show), hide (never show) or auto. */
export const PATCH = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Menu item");
    const { mode } = await parseBody(req, schema);
    const item = await MenuItem.findByIdAndUpdate(params.id, { $set: { trendingMode: mode } }, { new: true }).lean();
    if (!item) throw Errors.notFound("Menu item");
    await logAudit(user, "MENU_TRENDING_SET", "MenuItem", params.id, { mode, name: item.name });
    return ok(item);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.central.manage" }
);
