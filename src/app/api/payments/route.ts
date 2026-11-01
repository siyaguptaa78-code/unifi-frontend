import { route, ok } from "@/lib/api";
import { paging, pageMeta, dateRange, escapeRegex } from "@/lib/query";
import { Payment } from "@/models";

export const GET = route(
  async ({ req }) => {
    const p = paging(req, 20);
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const q = sp.get("q");

    const match: Record<string, unknown> = {
      ...dateRange(req, "createdAt"),
      ...(status ? { status } : {}),
    };
    if (q) {
      match.receipt = { $regex: escapeRegex(q), $options: "i" };
    }

    const [payments, total] = await Promise.all([
      Payment.find(match)
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("customer", "name email mobile")
        .select("-signature")
        .lean(),
      Payment.countDocuments(match),
    ]);

    return ok(payments, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN"], permission: "payments.view" }
);

