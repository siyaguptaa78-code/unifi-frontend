import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { z } from "zod";
import { setCafeAllowedIps } from "@/services/cafe-insights.service";

const schema = z.object({ allowedIps: z.array(z.string().trim().max(64)).max(50) });

/** Super Admin sets the IP addresses from which this cafe's franchise owner / manager / staff may log in. */
export const PUT = route<{ id: string }>(
  async ({ req, user, params }) => {
    assertObjectId(params.id, "Cafe");
    const { allowedIps } = await parseBody(req, schema);
    return ok(await setCafeAllowedIps(user, params.id, allowedIps));
  },
  { roles: ["SUPER_ADMIN"], permission: "cafes.manage" }
);
