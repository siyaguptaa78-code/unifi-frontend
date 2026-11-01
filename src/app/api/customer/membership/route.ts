import { route, ok } from "@/lib/api";
import { getMembershipOverview } from "@/services/membership.service";

export const GET = route(
  async ({ user }) => {
    const data = await getMembershipOverview(user.id);
    return ok(data);
  },
  { roles: ["CUSTOMER"] }
);

