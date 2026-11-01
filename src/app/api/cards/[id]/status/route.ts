import { route, ok, parseBody, assertObjectId } from "@/lib/api";
import { setCardStatus } from "@/services/card.service";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED", "LOST", "INACTIVE"]),
  note: z.string().optional(),
});

export const PATCH = route(
  async ({ req, user, params, ip }) => {
    assertObjectId(params.id, "Card");
    const input = await parseBody(req, statusSchema);
    const card = await setCardStatus(user, params.id, input.status, input.note, ip);
    return ok(card);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "cards.manage" }
);

