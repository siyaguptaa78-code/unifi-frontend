import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { updateBook } from "@/services/book.service";

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  author: z.string().trim().max(120).optional(),
  isbn: z.string().trim().max(20).optional(),
  pricePoints: z.coerce.number().int().min(1).max(100000).optional(),
  stock: z.coerce.number().int().min(0).max(10000).optional(),
  active: z.boolean().optional(),
});

export const PATCH = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Book");
    const input = await parseBody(req, patchSchema);
    return ok(await updateBook(user, params.id, input));
  },
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER", "MANAGER"] }
);
