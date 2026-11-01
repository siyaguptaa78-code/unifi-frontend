import { route, ok } from "@/lib/api";
import { paging, pageMeta, dateRange } from "@/lib/query";
import { AuditLog } from "@/models";

export const GET = route(
  async ({ req }) => {
    const p = paging(req, 30);
    const sp = req.nextUrl.searchParams;
    const action = sp.get("action");
    const entity = sp.get("entity");

    const match: Record<string, unknown> = {
      ...dateRange(req, "createdAt"),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
    };

    const [logs, total] = await Promise.all([
      AuditLog.find(match)
        .sort({ createdAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("cafe", "name code")
        .lean(),
      AuditLog.countDocuments(match),
    ]);

    return ok(logs, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN"], permission: "audit.view" }
);

