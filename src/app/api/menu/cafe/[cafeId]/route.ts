import { publicRoute, ok, assertObjectId } from "@/lib/api";
import { getCafeMenu } from "@/services/menu.service";

export const GET = publicRoute(async ({ req, params }) => {
  const cafeId = params.cafeId;
  assertObjectId(cafeId, "Cafe");
  const includeUnavailable = req.nextUrl.searchParams.get("includeUnavailable") === "true";
  const menu = await getCafeMenu(cafeId, { includeUnavailable });
  return ok(menu);
});

