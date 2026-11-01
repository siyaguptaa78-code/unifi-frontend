import { cookies } from "next/headers";
import { publicRoute, ok } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/jwt";

export const POST = publicRoute(async () => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return ok({ message: "Logged out successfully" });
});

