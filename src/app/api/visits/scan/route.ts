import { route, ok, parseBody } from "@/lib/api";
import { scanSchema } from "@/lib/validators";
import { processScan } from "@/services/visit.service";
import { requestVisitOtp, verifyVisitOtp } from "@/services/visit-otp.service";
import { getBooleanSetting } from "@/services/settings.service";

/**
 * Card tap. When `visits.otpRequired` is on (default), the first call sends an OTP to the
 * customer and returns `otpRequired: true`; the second call (with `otpRequestId` + `otp`)
 * confirms it and performs the entry/exit.
 */
export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, scanSchema);
    if (input.otpRequestId && input.otp) {
      return ok(await verifyVisitOtp(user, input.otpRequestId, input.otp, ip));
    }
    if (await getBooleanSetting("visits.otpRequired")) {
      return ok(await requestVisitOtp(user, input));
    }
    return ok(await processScan(user, input, ip));
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "visits.scan" }
);
