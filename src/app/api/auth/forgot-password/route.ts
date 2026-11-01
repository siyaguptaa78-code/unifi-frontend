import { publicRoute, ok, parseBody } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/services/auth.service";

export const POST = publicRoute(
  async ({ req }) => {
    const input = await parseBody(req, forgotPasswordSchema);
    const res = await requestPasswordReset(input.identifier);
    return ok({
      message: "If an active account exists, password reset instructions have been sent.",
      devResetUrl: res.devResetUrl,
    });
  },
  { rateLimit: { name: "auth_forgot", limit: 5, windowMs: 60000 } }
);

