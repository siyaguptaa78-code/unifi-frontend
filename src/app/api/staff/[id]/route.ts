import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { User, Staff, Cafe } from "@/models";
import { adminUpdateUserSchema } from "@/lib/validators";
import { logAudit } from "@/services/audit.service";
import { Errors } from "@/lib/errors";

export const GET = route(
  async ({ params }) => {
    const userId = assertObjectId(params.id, "User");
    const targetUser = await User.findById(userId).select("-passwordHash").lean();
    if (!targetUser) throw Errors.notFound("User");

    const staffProfile = await Staff.findOne({ user: userId })
      .populate("cafes", "name code")
      .lean();

    return ok({ user: targetUser, staff: staffProfile });
  },
  { roles: ["SUPER_ADMIN"], permission: "staff.view" }
);

export const PATCH = route(
  async ({ req, user, params, ip }) => {
    const userId = assertObjectId(params.id, "User");
    const input = await parseBody(req, adminUpdateUserSchema);

    const targetUser = await User.findById(userId);
    if (!targetUser) throw Errors.notFound("User");

    // Privilege guard: only SUPER_ADMIN can promote to or edit SUPER_ADMIN
    if (input.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      throw Errors.forbidden("Only Super Admin can assign the Super Admin role");
    }

    if (input.email && input.email !== targetUser.email) {
      const emailTaken = await User.exists({ email: input.email.toLowerCase(), _id: { $ne: userId } });
      if (emailTaken) throw Errors.conflict("Email is already registered");
      targetUser.email = input.email.toLowerCase();
    }

    if (input.mobile && input.mobile !== targetUser.mobile) {
      const mobileTaken = await User.exists({ mobile: input.mobile, _id: { $ne: userId } });
      if (mobileTaken) throw Errors.conflict("Mobile number is already registered");
      targetUser.mobile = input.mobile;
    }

    if (input.name) targetUser.name = input.name;
    if (input.role) targetUser.role = input.role;
    if (input.status) {
      targetUser.status = input.status;
      if (input.status === "SUSPENDED") {
        targetUser.tokenVersion = (targetUser.tokenVersion ?? 0) + 1;
      }
    }

    await targetUser.save();

    // Update staff profile if applicable (MANAGER or STAFF)
    if (targetUser.role === "MANAGER" || targetUser.role === "STAFF") {
      let staff = await Staff.findOne({ user: userId });
      if (!staff) {
        staff = new Staff({
          user: userId,
          position: targetUser.role,
          employeeCode: `EMP-${targetUser.role.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
          permissions: { canAssignCards: false, canCancelOrders: true },
        });
      }

      staff.position = targetUser.role;
      if (input.designation !== undefined) staff.designation = input.designation;
      if (input.cafes !== undefined) staff.cafes = input.cafes as any;

      const currentPerms = staff.permissions || { canAssignCards: false, canCancelOrders: true };
      staff.permissions = {
        canAssignCards: input.canAssignCards !== undefined ? input.canAssignCards : currentPerms.canAssignCards,
        canCancelOrders: input.canCancelOrders !== undefined ? input.canCancelOrders : currentPerms.canCancelOrders,
      };

      await staff.save();
    }

    await logAudit(
      user,
      "INTERNAL_USER_UPDATED",
      "User",
      userId,
      { changes: input },
      { ip }
    );

    return ok({ user: targetUser, message: "User updated successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "staff.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    const userId = assertObjectId(params.id, "User");
    const targetUser = await User.findById(userId);
    if (!targetUser) throw Errors.notFound("User");

    if (targetUser.role === "SUPER_ADMIN" && String(targetUser._id) === user.id) {
      throw Errors.badRequest("You cannot deactivate your own Super Admin account");
    }

    targetUser.status = "SUSPENDED";
    targetUser.tokenVersion = (targetUser.tokenVersion ?? 0) + 1;
    await targetUser.save();

    await logAudit(user, "INTERNAL_USER_DEACTIVATED", "User", userId, {}, { ip });
    return ok({ message: "User suspended successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "staff.manage" }
);
