import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { adjustCafePoints } from "@/services/cafe-insights.service";

const schema = z.object({
  points: z.coerce.number().int().min(-10_000_000).max(10_000_000),
  note: z.string().trim().max(200).default("Points allocation"),
});

/** Super Admin assigns (or removes) a branch's points budget. */
export const POST = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Cafe");
    const input = await parseBody(req, schema);
    return ok(await adjustCafePoints(user, params.id, input.points, input.note || "Points allocation", "ALLOCATION"));
  },
  { roles: ["SUPER_ADMIN"], permission: "cafes.manage" }
);
