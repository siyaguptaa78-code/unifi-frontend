import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { Membership, PointsLedger, User } from "@/models";
import { adminAdjustMembershipSchema } from "@/lib/validators";
import { logAudit } from "@/services/audit.service";
import { withTransaction } from "@/lib/db";
import { Errors } from "@/lib/errors";

export const POST = route(
  async ({ req, user, params, ip }) => {
    const custId = assertObjectId(params.id, "Customer");
    const input = await parseBody(req, adminAdjustMembershipSchema);

    const customer = await User.findById(custId).lean();
    if (!customer || customer.role !== "CUSTOMER") throw Errors.notFound("Customer");

    const result = await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const mem = await Membership.findOne({ customer: custId }, null, opts);
      if (!mem) throw Errors.notFound("Membership record");

      const beforePoints = mem.pointsBalance;
      const beforeMinutes = mem.remainingMinutes;

      if (input.status) {
        mem.status = input.status;
        if (input.status === "ACTIVE" && !mem.activatedAt) {
          mem.activatedAt = new Date();
        }
      }

      if (input.hoursDelta && input.hoursDelta !== 0) {
        const deltaMin = Math.round(input.hoursDelta * 60);
        mem.remainingMinutes = Math.max(0, mem.remainingMinutes + deltaMin);
      }

      if (input.pointsDelta && input.pointsDelta !== 0) {
        const newBalance = mem.pointsBalance + input.pointsDelta;
        if (newBalance < 0) {
          throw Errors.business("INSUFFICIENT_POINTS", "Adjustment would result in negative points balance");
        }
        mem.pointsBalance = newBalance;
        if (input.pointsDelta > 0) {
          mem.totalPointsCredited = (mem.totalPointsCredited ?? 0) + input.pointsDelta;
        }

        const type = input.pointsDelta > 0 ? "CREDIT" : "DEBIT";
        await PointsLedger.create(
          [
            {
              customer: custId,
              membership: mem._id,
              type,
              points: input.pointsDelta,
              balanceAfter: newBalance,
              source: "ADMIN",
              reference: `ADJUST-${Date.now()}`,
              description: `Admin adjustment: ${input.reason}`,
              performedBy: user.id,
            },
          ],
          opts
        );
      }

      await mem.save(opts);
      return {
        membership: mem,
        before: { points: beforePoints, minutes: beforeMinutes },
        after: { points: mem.pointsBalance, minutes: mem.remainingMinutes },
      };
    });

    await logAudit(
      user,
      "MEMBERSHIP_ADJUSTED_BY_ADMIN",
      "Membership",
      result.membership._id,
      {
        customer: custId,
        reason: input.reason,
        status: input.status,
        pointsDelta: input.pointsDelta,
        hoursDelta: input.hoursDelta,
        before: result.before,
        after: result.after,
      },
      { ip }
    );

    return ok({ success: true, data: result.membership, message: "Membership updated successfully" });
  },
  { roles: ["SUPER_ADMIN"], permission: "memberships.manage" }
);
