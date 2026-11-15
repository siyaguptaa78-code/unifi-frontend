import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { sellBook } from "@/services/book.service";

const schema = z.object({ uid: z.string().trim().toUpperCase().min(4).max(32) });

export const POST = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Book");
    const { uid } = await parseBody(req, schema);
    return ok(await sellBook(user, params.id, uid), undefined, 201);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] }
);
