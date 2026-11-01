import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { correctVisit } from "@/services/visit.service";
import { z } from "zod";

const correctSchema = z.object({
  exitAt: z.string(),
  reason: z.string().trim().min(3).max(300),
});

export const POST = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "VisitSession");
    const input = await parseBody(req, correctSchema);
    const corrected = await correctVisit(user, params.id, input, ip);
    return ok(corrected);
  },
  { roles: ["SUPER_ADMIN", "MANAGER"], permission: "visits.correct" }
);

