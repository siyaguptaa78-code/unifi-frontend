import { route, ok, parseBody } from "@/lib/api";
import { z } from "zod";
import { placeCounterOrder } from "@/services/order.service";

const schema = z.object({
  uid: z.string().trim().toUpperCase().min(4).max(32),
  cafeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid cafe"),
  notes: z.string().trim().max(300).optional(),
  idempotencyKey: z.string().min(8).max(64),
  items: z
    .array(z.object({ menuItemId: z.string().regex(/^[a-f\d]{24}$/i), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Add at least one item")
    .max(30),
});

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, schema);
    const result = await placeCounterOrder(user, input);
    return ok(result, undefined, result.duplicate ? 200 : 201);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "orders.update" }
);
