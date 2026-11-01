import { route, ok } from "@/lib/api";
import { paging, pageMeta } from "@/lib/query";
import { VisitSession } from "@/models";

export const GET = route(
  async ({ req, user }) => {
    const p = paging(req, 20);
    const [visits, total, active] = await Promise.all([
      VisitSession.find({ customer: user.id })
        .sort({ entryAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code address")
        .populate("exitCafe", "name code")
        .lean(),
      VisitSession.countDocuments({ customer: user.id }),
      VisitSession.findOne({ customer: user.id, status: "ACTIVE" })
        .populate("cafe", "name code address")
        .lean(),
    ]);

    return ok({ visits, active }, pageMeta(p, total));
  },
  { roles: ["CUSTOMER"] }
);

