import { route, ok, parseBody } from "@/lib/api";
import { paging, pageMeta, escapeRegex } from "@/lib/query";
import { cardAssignSchema } from "@/lib/validators";
import { assignCard } from "@/services/card.service";
import { MembershipCard } from "@/models";

export const GET = route(
  async ({ req }) => {
    const p = paging(req, 20);
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const q = sp.get("q");

    const match: Record<string, unknown> = status ? { status } : {};
    if (q) {
      match.$or = [
        { cardNumber: { $regex: escapeRegex(q), $options: "i" } },
        { uid: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    const [cards, total] = await Promise.all([
      MembershipCard.find(match)
        .sort({ updatedAt: -1 })
        .skip(p.skip)
        .limit(p.limit)
        .populate("customer", "name email mobile")
        .populate("assignedCafe", "name code")
        .lean(),
      MembershipCard.countDocuments(match),
    ]);

    return ok(cards, pageMeta(p, total));
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "cards.manage" }
);

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, cardAssignSchema);
    const card = await assignCard(user, input, ip);
    return ok(card, undefined, 201);
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "cards.manage" }
);

