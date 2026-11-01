import { route, ok } from "@/lib/api";
import { paging, pageMeta } from "@/lib/query";
import { getWalletSummary } from "@/services/wallet.service";
import { PointsLedger } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 20);
    const [summary, ledger, total] = await Promise.all([
      getWalletSummary(user.id),
      PointsLedger.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code")
        .lean(),
      PointsLedger.countDocuments({ customer: user.id }),
    ]);

    return ok({ summary, ledger }, pageMeta(p, total));
  },
  { roles: ["CUSTOMER"] }
);

