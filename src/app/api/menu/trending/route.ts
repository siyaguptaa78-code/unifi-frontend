import { publicRoute, ok } from "@/lib/api";
import { getTrending } from "@/services/trending.service";

export const GET = publicRoute(async ({ req }) => ok(await getTrending(req.nextUrl.searchParams.get("cafeId"))));
