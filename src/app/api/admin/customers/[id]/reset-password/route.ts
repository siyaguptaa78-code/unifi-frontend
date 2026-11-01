import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { User } from "@/models";
import { adminResetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/services/auth.service";
import { logAudit } from "@/services/audit.service";
import { Errors } from "@/lib/errors";

export const POST = route(
  async ({ req, user, params, ip }) => {
    const custId = assertObjectId(params.id, "Customer");
    const input = await parseBody(req, adminResetPasswordSchema);

    const target = await User.findById(custId);
    if (!target || target.role !== "CUSTOMER") throw Errors.notFound("Customer");

    target.passwordHash = await hashPassword(input.password);
    target.tokenVersion = (target.tokenVersion ?? 0) + 1;
    await target.save();

    await logAudit(user, "CUSTOMER_PASSWORD_RESET", "User", custId, {}, { ip });

    return ok({ message: "Customer password reset successfully. All active sessions terminated." });
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.manage" }
);

