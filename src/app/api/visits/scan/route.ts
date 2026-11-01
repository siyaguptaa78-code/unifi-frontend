import { route, ok, parseBody } from "@/lib/api";
import { scanSchema } from "@/lib/validators";
import { processScan } from "@/services/visit.service";

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, scanSchema);
    const result = await processScan(user, input, ip);
    return ok(result);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "visits.scan" }
);

