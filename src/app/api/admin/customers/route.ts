import { route, ok } from "@/lib/api";
import { paging, pageMeta, escapeRegex } from "@/lib/query";
import { User, Membership, CustomerProfile, MembershipCard } from "@/models";

export const GET = route(
  async ({ req }) => {
    const p = paging(req, 20);
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q");

    const match: Record<string, unknown> = { role: "CUSTOMER" };
    if (q) {
      match.$or = [
        { name: { $regex: escapeRegex(q), $options: "i" } },
        { email: { $regex: escapeRegex(q), $options: "i" } },
        { mobile: { $regex: escapeRegex(q) } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(match).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit).lean(),
      User.countDocuments(match),
    ]);

    const uIds = users.map((u) => u._id);
    const [profiles, memberships, cards] = await Promise.all([
      CustomerProfile.find({ user: { $in: uIds } }).lean(),
      Membership.find({ customer: { $in: uIds } }).lean(),
      MembershipCard.find({ customer: { $in: uIds }, status: "ACTIVE" }).lean(),
    ]);

    const profMap = new Map(profiles.map((p) => [String(p.user), p]));
    const memMap = new Map(memberships.map((m) => [String(m.customer), m]));
    const cardMap = new Map(cards.map((c) => [String(c.customer), c]));

    const rows = users.map((u) => ({
      ...u,
      profile: profMap.get(String(u._id)) || null,
      membership: memMap.get(String(u._id)) || null,
      card: cardMap.get(String(u._id)) || null,
    }));

    return ok(rows, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.view" }
);

