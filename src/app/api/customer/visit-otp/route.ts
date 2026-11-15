import { route, ok } from "@/lib/api";
import { getActiveVisitOtp } from "@/services/visit-otp.service";

export const GET = route(async ({ user }) => ok(await getActiveVisitOtp(user.id)), { roles: ["CUSTOMER"] });
