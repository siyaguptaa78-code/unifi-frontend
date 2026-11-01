import { route, ok } from "@/lib/api";
import { User, CustomerProfile, Membership, Staff } from "@/models";

export const GET = route(async ({ user }) => {
  const [profile, membership, staff] = await Promise.all([
    user.role === "CUSTOMER" ? CustomerProfile.findOne({ user: user.id }).lean() : null,
    user.role === "CUSTOMER" ? Membership.findOne({ customer: user.id }).lean() : null,
    ["MANAGER", "STAFF"].includes(user.role)
      ? Staff.findOne({ user: user.id }).populate("cafes", "name code address").lean()
      : null,
  ]);

  return ok({
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      profile,
      membership: membership
        ? {
            status: membership.status,
            pointsBalance: membership.pointsBalance,
            remainingMinutes: membership.remainingMinutes,
            rechargeCount: membership.rechargeCount,
          }
        : null,
      staff: staff
        ? {
            position: staff.position,
            designation: staff.designation,
            employeeCode: staff.employeeCode,
            cafes: staff.cafes,
            permissions: staff.permissions,
          }
        : null,
    },
  });
});

