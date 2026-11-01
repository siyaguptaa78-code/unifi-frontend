import { route, ok, parseBody } from "@/lib/api";
import { setAvailability, requestPriceOverride, requestLocalItem } from "@/services/menu.service";
import { localItemRequestSchema } from "@/lib/validators";
import { z } from "zod";

const availabilitySchema = z.object({
  cafeId: z.string(),
  menuItemId: z.string(),
  isAvailable: z.boolean(),
});

const priceOverrideSchema = z.object({
  cafeId: z.string(),
  menuItemId: z.string(),
  price: z.number().int().min(1),
});

export const POST = route(
  async ({ req, user, ip }) => {
    const json = await req.json();
    const action = json.action;

    if (action === "toggle_availability") {
      const data = availabilitySchema.parse(json);
      const res = await setAvailability(user, data.cafeId, data.menuItemId, data.isAvailable, ip);
      return ok(res);
    }

    if (action === "request_price_override") {
      const data = priceOverrideSchema.parse(json);
      const res = await requestPriceOverride(user, data.cafeId, data.menuItemId, data.price, ip);
      return ok(res);
    }

    if (action === "request_local_item") {
      const data = localItemRequestSchema.parse(json);
      const res = await requestLocalItem(user, data, ip);
      return ok(res, undefined, 201);
    }

    return ok({ message: "Unknown action" }, undefined, 400);
  },
  { roles: ["SUPER_ADMIN", "FRANCHISE_OWNER", "MANAGER"] }
);

