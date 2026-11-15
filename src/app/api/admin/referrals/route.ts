import { route, ok } from "@/lib/api";
import { listReferrals, referralConfig } from "@/services/referral.service";

export const GET = route(
  async () => {
    const [config, rows] = await Promise.all([referralConfig(), listReferrals()]);
    return ok({ config, rows });
  },
  { roles: ["SUPER_ADMIN"], permission: "settings.manage" }
);
