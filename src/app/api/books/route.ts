import { route, ok, parseBody } from "@/lib/api";
import { z } from "zod";
import { createBook, listBooks } from "@/services/book.service";

const bookSchema = z.object({
  cafeId: z.string().regex(/^[a-f\d]{24}$/i, "Select a cafe"),
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().max(120).optional(),
  isbn: z.string().trim().max(20).optional(),
  pricePoints: z.coerce.number().int().min(1).max(100000),
  stock: z.coerce.number().int().min(0).max(10000).default(1),
  active: z.boolean().optional(),
});

export const GET = route(async ({ req, user }) => ok(await listBooks(user, req.nextUrl.searchParams.get("cafeId"))));

export const POST = route(
  async ({ req, user }) => {
    const input = await parseBody(req, bookSchema);
    return ok(await createBook(user, input), undefined, 201);
  },
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER", "MANAGER"] }
);
