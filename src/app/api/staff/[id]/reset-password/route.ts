import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { User } from "@/models";
import { adminResetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/services/auth.service";
import { logAudit } from "@/services/audit.service";
import { Errors } from "@/lib/errors";

export const POST = route(
  async ({ req, user, params, ip }) => {
    const userId = assertObjectId(params.id, "User");
    const input = await parseBody(req, adminResetPasswordSchema);

    const target = await User.findById(userId);
    if (!target) throw Errors.notFound("User");

    target.passwordHash = await hashPassword(input.password);
    target.tokenVersion = (target.tokenVersion ?? 0) + 1;
    await target.save();

    await logAudit(user, "INTERNAL_USER_PASSWORD_RESET", "User", userId, { role: target.role }, { ip });

    return ok({ message: `Password reset successfully for ${target.name}. Active sessions invalidated.` });
  },
  { roles: ["SUPER_ADMIN"], permission: "users.manage" }
);

