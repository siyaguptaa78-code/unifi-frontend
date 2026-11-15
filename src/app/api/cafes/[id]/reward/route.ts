import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { adjustCafePoints } from "@/services/cafe-insights.service";

const schema = z.object({
  points: z.coerce.number().int().min(1).max(1_000_000),
  note: z.string().trim().min(3).max(200),
});

/** Franchise owner (or Super Admin) rewards a cafe — e.g. for strong Trendy Food sales. */
export const POST = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Cafe");
    const input = await parseBody(req, schema);
    return ok(await adjustCafePoints(user, params.id, input.points, input.note, "REWARD"));
  },
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER"] }
);
