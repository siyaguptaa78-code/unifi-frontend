import { route, ok, parseBody } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validators";
import { changePassword } from "@/services/auth.service";

export const POST = route(async ({ req, user }) => {
  const input = await parseBody(req, changePasswordSchema);
  await changePassword(user.id, input.currentPassword, input.password);
  return ok({ message: "Password updated successfully" });
});

