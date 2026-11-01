import { route, ok } from "@/lib/api";
import { ensureDigitalCard } from "@/services/membership.service";
import { MembershipCard } from "@/models";

export const GET = route(
  async ({ user }) => {
    let card: any = await MembershipCard.findOne({ customer: user.id, status: "ACTIVE" })
      .populate("assignedCafe", "name code address")
      .lean();

    if (!card) {
      const created = await ensureDigitalCard(user.id);
      card = created.toObject();
    }

    const cardHistory = await MembershipCard.find({ customer: user.id })
      .sort({ createdAt: -1 })
      .populate("assignedCafe", "name code")
      .lean();

    return ok({ card, cardHistory });
  },
  { roles: ["CUSTOMER"] }
);
