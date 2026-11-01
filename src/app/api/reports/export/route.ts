import { NextResponse } from "next/server";
import { route, parseBody } from "@/lib/api";
import { runReport, toCsv, REPORTS } from "@/services/report.service";
import { z } from "zod";

const exportSchema = z.object({
  key: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  cafeId: z.string().optional(),
  franchiseId: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, exportSchema);
    const def = REPORTS[input.key];
    if (!def) {
      return NextResponse.json({ success: false, error: { message: "Report not found" } }, { status: 404 });
    }

    // Export up to 1000 records
    const result = await runReport(user, input.key, input, 1, 1000);
    const csv = toCsv(def.columns, result.rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${input.key}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER"], permission: "reports.view" }
);

