import { Cafe } from "@/models/Cafe";
import { Errors } from "@/lib/errors";
import { getCafeScope } from "@/services/scope.service";
import type { AuthUser } from "@/lib/auth/session";

/** Roles whose login is tied to their cafe's network. */
export const IP_RESTRICTED_ROLES = ["FRANCHISE_OWNER", "MANAGER", "STAFF"] as const;

/** Exact match, or a pattern with `*` per segment, e.g. 203.0.113.* */
export function ipMatches(ip: string, pattern: string) {
  const clean = ip.replace(/^::ffff:/, "").trim();
  if (pattern === clean) return true;
  if (!pattern.includes("*")) return false;
  // Patterns are validated to contain only hex digits, ":", "." and "*", so only "." needs escaping.
  const re = new RegExp("^" + pattern.split("*").map((p) => p.split(".").join("\\.")).join("[0-9a-fA-F]*") + "$");
  return re.test(clean);
}

/**
 * Blocks login for cafe-bound roles when any of their cafes has an IP allow-list and the
 * request does not come from one of the listed addresses.
 */
export async function assertLoginIpAllowed(user: AuthUser, ip: string) {
  if (!(IP_RESTRICTED_ROLES as readonly string[]).includes(user.role)) return;
  const scope = await getCafeScope(user);
  if (!scope || scope.length === 0) return;
  const cafes = await Cafe.find({ _id: { $in: scope } }).select("allowedIps").lean();
  const allowed = cafes.flatMap((c) => c.allowedIps ?? []);
  if (allowed.length === 0) return; // no restriction configured
  if (!allowed.some((p) => ipMatches(ip, p))) {
    throw Errors.forbidden(`Login is only allowed from your cafe's network. Your IP (${ip}) is not on the allowed list.`);
  }
}
