import { cookies } from "next/headers";
import { publicRoute, route, ok, parseBody } from "@/lib/api";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@/lib/validators";
import { registerCustomer, authenticate, requestPasswordReset, resetPassword, changePassword } from "@/services/auth.service";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/jwt";
import { ROLE_HOME } from "@/lib/rbac";
import { logAudit } from "@/services/audit.service";

export const POST = publicRoute(
  async ({ req, ip }) => {
    const input = await parseBody(req, registerSchema);
    const user = await registerCustomer(input);
    const token = await signSession({ sub: user.id, role: user.role, tv: user.tokenVersion, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    await logAudit(
      { id: user.id, role: user.role, name: user.name, email: user.email, mobile: input.mobile },
      "CUSTOMER_REGISTERED",
      "User",
      user.id,
      { email: user.email },
      { ip }
    );

    return ok({ user, redirectUrl: ROLE_HOME[user.role] }, undefined, 201);
  },
  { rateLimit: { name: "auth_register", limit: 10, windowMs: 60000 } }
);

