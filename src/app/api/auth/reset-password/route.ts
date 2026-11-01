import { publicRoute, ok, parseBody } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword } from "@/services/auth.service";

export const POST = publicRoute(
  async ({ req }) => {
    const input = await parseBody(req, resetPasswordSchema);
    await resetPassword(input.token, input.password);
    return ok({ message: "Password reset successfully. You can now log in with your new password." });
  },
  { rateLimit: { name: "auth_reset", limit: 5, windowMs: 60000 } }
);

