import { route, ok, parseBody } from "@/lib/api";
import { getPendingApprovals, reviewLocalItem, reviewPriceOverride } from "@/services/menu.service";
import { z } from "zod";

const reviewSchema = z.object({
  type: z.enum(["LOCAL_ITEM", "PRICE_OVERRIDE"]),
  id: z.string(),
  approve: z.boolean(),
  note: z.string().optional(),
});

export const GET = route(
  async () => {
    const approvals = await getPendingApprovals();
    return ok(approvals);
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.approve" }
);

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, reviewSchema);
    if (input.type === "LOCAL_ITEM") {
      const res = await reviewLocalItem(user, input.id, input.approve, input.note, ip);
      return ok(res);
    } else {
      const res = await reviewPriceOverride(user, input.id, input.approve, input.note, ip);
      return ok(res);
    }
  },
  { roles: ["SUPER_ADMIN"], permission: "menu.approve" }
);

