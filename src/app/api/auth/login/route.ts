import { cookies } from "next/headers";
import { publicRoute, ok, parseBody } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { authenticate } from "@/services/auth.service";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/jwt";
import { ROLE_HOME } from "@/lib/rbac";
import { logAudit } from "@/services/audit.service";
import { assertLoginIpAllowed } from "@/services/ip-access.service";

export const POST = publicRoute(
  async ({ req, ip }) => {
    const input = await parseBody(req, loginSchema);
    const user = await authenticate(input.identifier, input.password);
    try {
      await assertLoginIpAllowed({ id: user.id, role: user.role, name: user.name, email: user.email, mobile: "" }, ip);
    } catch (e) {
      await logAudit({ id: user.id, role: user.role, name: user.name, email: user.email, mobile: "" }, "AUTH_LOGIN_BLOCKED_IP", "User", user.id, { ip }, { ip });
      throw e;
    }
    const token = await signSession({ sub: user.id, role: user.role, tv: user.tokenVersion, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    await logAudit(
      { id: user.id, role: user.role, name: user.name, email: user.email, mobile: "" },
      "AUTH_LOGIN",
      "User",
      user.id,
      { identifier: input.identifier },
      { ip }
    );

    return ok({ user, redirectUrl: ROLE_HOME[user.role] });
  },
  { rateLimit: { name: "auth_login", limit: 20, windowMs: 60000 } }
);

