import { route, ok, parseBody } from "@/lib/api";
import { internalUserSchema } from "@/lib/validators";
import { hashPassword } from "@/services/auth.service";
import { User, Staff, Cafe } from "@/models";
import { Errors } from "@/lib/errors";
import { logAudit } from "@/services/audit.service";
import { getCafeScope } from "@/services/scope.service";

export const GET = route(
  async ({ user }) => {
    let match: Record<string, unknown> = { role: { $in: ["SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF"] } };
    if (user.role === "MANAGER" || user.role === "FRANCHISE_OWNER") {
      match = { role: { $in: ["MANAGER", "STAFF"] } };
    }

    // Cafe-scoped roles only see people who work at their own cafes.
    if (user.role !== "SUPER_ADMIN") {
      const scope = (await getCafeScope(user)) ?? [];
      const staffInScope = await Staff.find({ cafes: { $in: scope } }).select("user").lean();
      match._id = { $in: staffInScope.map((s) => s.user) };
    }

    const users = await User.find(match).select("name email mobile role status createdAt").lean();
    const uIds = users.map((u) => u._id);
    const staffProfiles = await Staff.find({ user: { $in: uIds } })
      .populate("cafes", "name code")
      .lean();

    const staffMap = new Map(staffProfiles.map((s) => [String(s.user), s]));

    const rows = users.map((u) => ({
      ...u,
      staff: staffMap.get(String(u._id)) || null,
    }));

    return ok(rows);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER"], permission: "staff.view" }
);

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, internalUserSchema);

    // Privilege guard: managers may only add staff, franchise owners managers/staff, and only
    // for their own cafes. Only the Super Admin can create supervisors, owners or admins.
    if (user.role !== "SUPER_ADMIN") {
      const allowed = user.role === "FRANCHISE_OWNER" ? ["MANAGER", "STAFF"] : ["STAFF"];
      if (!allowed.includes(input.role)) throw Errors.forbidden(`You can only create ${allowed.join(" / ").toLowerCase()} accounts`);
      const scope = (await getCafeScope(user)) ?? [];
      const requested = input.cafes ?? [];
      if (!requested.length) throw Errors.badRequest("Assign at least one of your cafes");
      if (requested.some((c) => !scope.some((s) => String(s) === c))) throw Errors.forbidden("You can only assign people to your own cafes");
    }

    const [emailExists, mobileExists] = await Promise.all([
      User.exists({ email: input.email.toLowerCase() }),
      User.exists({ mobile: input.mobile }),
    ]);
    if (emailExists) throw Errors.conflict("Email is already registered");
    if (mobileExists) throw Errors.conflict("Mobile number is already registered");

    const pw = input.password || "Demo@123";
    const passwordHash = await hashPassword(pw);

    const createdUser = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      mobile: input.mobile,
      passwordHash,
      role: input.role,
      status: input.status,
    });

    if (input.role === "MANAGER" || input.role === "STAFF") {
      const code = `EMP-${input.role.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      await Staff.create({
        user: createdUser._id,
        position: input.role,
        designation: input.designation || (input.role === "MANAGER" ? "Cafe Manager" : "Barista"),
        employeeCode: code,
        cafes: input.cafes || [],
        permissions: {
          canAssignCards: input.canAssignCards ?? false,
          canCancelOrders: input.canCancelOrders ?? true,
        },
      });
    }

    await logAudit(user, "INTERNAL_USER_CREATED", "User", createdUser._id, { role: input.role, email: input.email }, { ip });
    return ok({ user: createdUser, message: "User created successfully" }, undefined, 201);
  },
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER", "MANAGER"], permission: "staff.manage" }
);

