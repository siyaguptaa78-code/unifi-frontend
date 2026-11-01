import { route, ok, parseBody } from "@/lib/api";
import { getAllSettings } from "@/services/settings.service";
import { SystemSetting } from "@/models";
import { z } from "zod";
import { logAudit } from "@/services/audit.service";

export const GET = route(
  async () => {
    const settings = await getAllSettings();
    return ok(settings);
  },
  { roles: ["SUPER_ADMIN"], permission: "settings.manage" }
);

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

export const PUT = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, updateSettingSchema);
    const updated = await SystemSetting.findOneAndUpdate(
      { key: input.key },
      { value: input.value, updatedBy: user.id },
      { upsert: true, new: true }
    );
    await logAudit(user, "SYSTEM_SETTING_UPDATED", "SystemSetting", input.key, { value: input.value }, { ip });
    return ok(updated);
  },
  { roles: ["SUPER_ADMIN"], permission: "settings.manage" }
);

