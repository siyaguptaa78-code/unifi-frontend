import { route, ok } from "@/lib/api";
import { findCustomerForCard } from "@/services/card.service";

export const GET = route(
  async ({ req }) => {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (q.trim().length < 3) return ok([]);
    const results = await findCustomerForCard(q);
    return ok(results);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "customers.lookup" }
);

