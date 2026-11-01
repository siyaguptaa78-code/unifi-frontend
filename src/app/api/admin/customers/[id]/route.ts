import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { User, Membership, CustomerProfile, MembershipCard, VisitSession, Order, PointsLedger } from "@/models";
import { adminUpdateCustomerSchema } from "@/lib/validators";
import { logAudit } from "@/services/audit.service";
import { Errors } from "@/lib/errors";

export const GET = route(
  async ({ params }) => {
    const custId = assertObjectId(params.id, "Customer");

    const [user, profile, membership, card, visits, orders, ledger] = await Promise.all([
      User.findById(custId).select("-passwordHash").lean(),
      CustomerProfile.findOne({ user: custId }).lean(),
      Membership.findOne({ customer: custId }).lean(),
      MembershipCard.findOne({ customer: custId, status: "ACTIVE" }).populate("assignedCafe", "name code").lean(),
      VisitSession.find({ customer: custId }).sort({ entryAt: -1 }).limit(10).populate("cafe", "name code").lean(),
      Order.find({ customer: custId }).sort({ createdAt: -1 }).limit(10).populate("cafe", "name code").lean(),
      PointsLedger.find({ customer: custId }).sort({ createdAt: -1 }).limit(15).populate("cafe", "name code").lean(),
    ]);

    if (!user || user.role !== "CUSTOMER") throw Errors.notFound("Customer");

    return ok({
      user,
      profile,
      membership,
      card,
      visits,
      orders,
      ledger,
    });
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.view" }
);

export const PATCH = route(
  async ({ req, user, params, ip }) => {
    const custId = assertObjectId(params.id, "Customer");
    const input = await parseBody(req, adminUpdateCustomerSchema);

    const target = await User.findById(custId);
    if (!target || target.role !== "CUSTOMER") throw Errors.notFound("Customer");

    if (input.email && input.email !== target.email) {
      const emailTaken = await User.exists({ email: input.email, _id: { $ne: custId } });
      if (emailTaken) throw Errors.conflict("Email is already taken by another account");
      target.email = input.email;
    }

    if (input.mobile && input.mobile !== target.mobile) {
      const mobileTaken = await User.exists({ mobile: input.mobile, _id: { $ne: custId } });
      if (mobileTaken) throw Errors.conflict("Mobile is already taken by another account");
      target.mobile = input.mobile;
    }

    if (input.name) target.name = input.name;
    if (input.status) {
      target.status = input.status;
      // Invalidate existing sessions if suspended
      if (input.status === "SUSPENDED") {
        target.tokenVersion = (target.tokenVersion ?? 0) + 1;
      }
    }

    await target.save();

    await logAudit(
      user,
      "CUSTOMER_PROFILE_UPDATED",
      "User",
      custId,
      { changes: input },
      { ip }
    );

    return ok({ user: target, message: "Customer profile updated successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.manage" }
);

export const DELETE = route(
  async ({ user, params, ip }) => {
    const custId = assertObjectId(params.id, "Customer");
    const target = await User.findById(custId);
    if (!target || target.role !== "CUSTOMER") throw Errors.notFound("Customer");

    target.status = "SUSPENDED";
    target.tokenVersion = (target.tokenVersion ?? 0) + 1;
    await target.save();

    await logAudit(user, "CUSTOMER_DEACTIVATED", "User", custId, {}, { ip });
    return ok({ message: "Customer suspended successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.manage" }
);

