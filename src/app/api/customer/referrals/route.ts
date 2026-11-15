import { route, ok } from "@/lib/api";
import { getReferralSummary } from "@/services/referral.service";

export const GET = route(async ({ user }) => ok(await getReferralSummary(user.id)), { roles: ["CUSTOMER"] });
