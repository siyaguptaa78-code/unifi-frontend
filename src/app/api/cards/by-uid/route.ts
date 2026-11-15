import { route, ok } from "@/lib/api";
import { Errors } from "@/lib/errors";
import { MembershipCard, Membership, User, CustomerProfile } from "@/models";
import { normalizeUid } from "@/services/card.service";

/** Counter lookup: who does this card belong to and what can they spend? */
export const GET = route(
  async ({ req }) => {
    const uid = normalizeUid(req.nextUrl.searchParams.get("uid") || "");
    if (uid.length < 4) throw Errors.badRequest("Enter a card UID");
    const card = await MembershipCard.findOne({ uid }).lean();
    if (!card) throw Errors.business("CARD_NOT_FOUND", "Card not recognised.");
    const [user, membership, profile] = await Promise.all([
      User.findById(card.customer).select("name mobile status").lean(),
      Membership.findOne({ customer: card.customer }).select("status pointsBalance remainingMinutes").lean(),
      CustomerProfile.findOne({ user: card.customer }).select("customerCode").lean(),
    ]);
    return ok({
      uid: card.uid,
      cardNumber: card.cardNumber,
      cardStatus: card.status,
      customer: { id: String(card.customer), name: user?.name, mobile: user?.mobile, customerCode: profile?.customerCode },
      membership: membership ?? null,
    });
  },
  { roles: ["SUPER_ADMIN", "MANAGER", "STAFF"], permission: "customers.lookup" }
);
