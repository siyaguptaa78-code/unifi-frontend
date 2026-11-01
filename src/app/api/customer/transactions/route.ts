import { route, ok } from "@/lib/api";
import { paging, pageMeta } from "@/lib/query";
import { Payment, MembershipTransaction } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 20);
    const [payments, transactions, totalPayments, totalTx] = await Promise.all([
      Payment.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .select("-signature")
        .lean(),
      MembershipTransaction.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .lean(),
      Payment.countDocuments({ customer: user.id }),
      MembershipTransaction.countDocuments({ customer: user.id }),
    ]);

    return ok({ payments, transactions }, { paymentsMeta: pageMeta(p, totalPayments), txMeta: pageMeta(p, totalTx) });
  },
  { roles: ["CUSTOMER"] }
);

