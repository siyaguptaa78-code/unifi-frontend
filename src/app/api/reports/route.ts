import { route, ok, parseBody } from "@/lib/api";
import { listReports, runReport } from "@/services/report.service";
import { z } from "zod";

const runReportSchema = z.object({
  key: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  cafeId: z.string().optional(),
  franchiseId: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const GET = route(
  async ({ user }) => {
    const reports = listReports(user.role);
    return ok(reports);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER"], permission: "reports.view" }
);

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, runReportSchema);
    const result = await runReport(
      user,
      input.key,
      {
        from: input.from,
        to: input.to,
        cafeId: input.cafeId,
        franchiseId: input.franchiseId,
        status: input.status,
        q: input.q,
      },
      input.page,
      input.limit
    );
    return ok(result);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER"], permission: "reports.view" }
);

