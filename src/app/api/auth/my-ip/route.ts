import { route, ok } from "@/lib/api";

/** Shows the caller their public IP, so the Super Admin can add a cafe's IP to its login allow-list. */
export const GET = route(async ({ ip }) => ok({ ip }));
