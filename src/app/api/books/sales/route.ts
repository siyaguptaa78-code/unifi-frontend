import { route, ok } from "@/lib/api";
import { listBookSales } from "@/services/book.service";

export const GET = route(async ({ req, user }) => {
  const sp = req.nextUrl.searchParams;
  return ok(await listBookSales(user, { cafeId: sp.get("cafeId"), uid: sp.get("uid") }));
});
