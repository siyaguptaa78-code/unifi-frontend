import { route, ok, parseBody } from "@/lib/api";
import { Membership, PointsLedger, User } from "@/models";
import { z } from "zod";
import { logAudit } from "@/services/audit.service";
import { withTransaction } from "@/lib/db";
import { Errors } from "@/lib/errors";

const adjustSchema = z.object({
  customerId: z.string().min(1),
  pointsDelta: z.coerce.number().int().refine((n) => n !== 0, "Points delta cannot be zero"),
  reason: z.string().trim().min(3, "Reason is required").max(300),
  reference: z.string().trim().max(100).optional(),
});

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, adjustSchema);

    const customer = await User.findById(input.customerId).lean();
    if (!customer) throw Errors.notFound("Customer");

    const result = await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const mem = await Membership.findOne({ customer: input.customerId }, null, opts);
      if (!mem) throw Errors.notFound("Customer membership");

      const newBalance = mem.pointsBalance + input.pointsDelta;
      if (newBalance < 0) {
        throw Errors.business("INSUFFICIENT_POINTS", "Adjustment would result in negative points balance");
      }

      mem.pointsBalance = newBalance;
      if (input.pointsDelta > 0) {
        mem.totalPointsCredited = (mem.totalPointsCredited ?? 0) + input.pointsDelta;
      }
      await mem.save(opts);

      const type = input.pointsDelta > 0 ? "CREDIT" : "DEBIT";
      const ref = input.reference || `ADJ-${Date.now()}`;

      const [ledgerEntry] = await PointsLedger.create(
        [
          {
            customer: input.customerId,
            membership: mem._id,
            type,
            points: input.pointsDelta,
            balanceAfter: newBalance,
            source: "ADMIN",
            reference: ref,
            description: input.reason,
            performedBy: user.id,
          },
        ],
        opts
      );

      return { mem, ledgerEntry };
    });

    await logAudit(
      user,
      "MANUAL_POINTS_ADJUSTMENT",
      "PointsLedger",
      result.ledgerEntry._id,
      {
        customer: input.customerId,
        pointsDelta: input.pointsDelta,
        reason: input.reason,
        newBalance: result.mem.pointsBalance,
      },
      { ip }
    );

    return ok({
      success: true,
      message: `Adjusted points by ${input.pointsDelta > 0 ? `+${input.pointsDelta}` : input.pointsDelta}. New balance: ${result.mem.pointsBalance} pts`,
      data: result.mem,
    });
  },
  { roles: ["SUPER_ADMIN"], permission: "ledger.adjust" }
);
