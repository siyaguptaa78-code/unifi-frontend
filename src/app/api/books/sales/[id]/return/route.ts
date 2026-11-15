import { route, ok, assertObjectId } from "@/lib/api";
import { returnBook } from "@/services/book.service";

export const POST = route<{ id: string }>(
  async ({ user, params }) => {
    assertObjectId(params.id, "Book sale");
    return ok(await returnBook(user, params.id));
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"] }
);
