import type { ClientSession, Types } from "mongoose";
import { CustomerProfile } from "@/models/CustomerProfile";
import { User } from "@/models/User";
import { Errors } from "@/lib/errors";
import { randomDigits } from "@/lib/ids";
import { creditPoints } from "@/services/wallet.service";
import { getBooleanSetting, getSetting } from "@/services/settings.service";
import { notify } from "@/services/notification.service";

type Id = string | Types.ObjectId;

export async function referralConfig() {
  const [enabled, referrerPoints, refereePoints] = await Promise.all([
    getBooleanSetting("referral.enabled"),
    getSetting("referral.referrerPoints"),
    getSetting("referral.refereePoints"),
  ]);
  return {
    enabled,
    referrerPoints: Math.max(0, Math.round(Number(referrerPoints) || 0)),
    refereePoints: Math.max(0, Math.round(Number(refereePoints) || 0)),
  };
}

/** Returns the customer's referral code, creating a readable one (e.g. ROHAN4821) on first use. */
export async function ensureReferralCode(userId: Id): Promise<string> {
  const profile = await CustomerProfile.findOne({ user: userId }).select("referralCode").lean();
  if (!profile) throw Errors.notFound("Customer profile");
  if (profile.referralCode) return profile.referralCode;
  const user = await User.findById(userId).select("name").lean();
  const stem = (user?.name ?? "UC").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 6) || "UC";
  for (let i = 0; i < 10; i++) {
    const code = `${stem}${randomDigits(4)}`;
    try {
      const res = await CustomerProfile.updateOne({ user: userId, referralCode: { $exists: false } }, { $set: { referralCode: code } });
      if (res.modifiedCount === 1) return code;
      const again = await CustomerProfile.findOne({ user: userId }).select("referralCode").lean();
      if (again?.referralCode) return again.referralCode;
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // code collision → retry
    }
  }
  throw new Error("Could not generate referral code");
}

/** Validates a referral code at sign-up. Returns the referrer's user id, or null when not applicable. */
export async function resolveReferrer(code: string | undefined | null) {
  const clean = (code ?? "").trim().toUpperCase();
  if (!clean) return null;
  const cfg = await referralConfig();
  if (!cfg.enabled) return null; // programme switched off: silently ignore codes
  const profile = await CustomerProfile.findOne({ referralCode: clean }).select("user").lean();
  if (!profile) throw Errors.badRequest("Invalid referral code", { field: "referralCode" });
  const referrer = await User.findById(profile.user).select("status role").lean();
  if (!referrer || referrer.status !== "ACTIVE" || referrer.role !== "CUSTOMER") {
    throw Errors.badRequest("This referral code is no longer active", { field: "referralCode" });
  }
  return profile.user;
}

/**
 * Credits both sides of a referral when the referred customer completes their first recharge.
 * Exactly-once: the conditional update on `referralRewardedAt` plus the ledger's unique
 * (source, refId, type) index prevent double rewards.
 */
export async function awardReferralOnFirstRecharge(customerId: Id, paymentId: Id, session?: ClientSession, isDemo = false) {
  const cfg = await referralConfig();
  if (!cfg.enabled) return null;
  const o = session ? { session } : {};
  const profile = await CustomerProfile.findOneAndUpdate(
    { user: customerId, referredBy: { $exists: true, $ne: null }, referralRewardedAt: { $exists: false } },
    { $set: { referralRewardedAt: new Date() } },
    { new: true, ...o }
  );
  if (!profile?.referredBy) return null;
  const referee = await User.findById(customerId).select("name").lean();

  if (cfg.refereePoints > 0) {
    await creditPoints({
      customerId,
      points: cfg.refereePoints,
      source: "REFERRAL",
      refModel: "Payment",
      refId: paymentId,
      reference: `REF-WELCOME-${String(customerId).slice(-6).toUpperCase()}`,
      description: `Referral welcome bonus — ${cfg.refereePoints} points`,
      session,
      isDemo,
      allowInactive: true,
    });
    await notify(customerId, "REFERRAL_REWARD", "Referral bonus added", `${cfg.refereePoints} bonus points added for joining with a referral code.`, {
      link: "/customer/wallet",
      session,
      isDemo,
    });
  }
  if (cfg.referrerPoints > 0) {
    await creditPoints({
      customerId: profile.referredBy,
      points: cfg.referrerPoints,
      source: "REFERRAL",
      refModel: "User",
      refId: customerId,
      reference: `REF-${String(customerId).slice(-6).toUpperCase()}`,
      description: `Referral reward — ${referee?.name ?? "your friend"} joined Unifi Cafe`,
      session,
      isDemo,
      allowInactive: true,
    });
    await notify(
      profile.referredBy,
      "REFERRAL_REWARD",
      "You earned a referral reward",
      `${referee?.name ?? "Your friend"} completed their first recharge. ${cfg.referrerPoints} points added to your wallet.`,
      { link: "/customer/wallet", session, isDemo }
    );
  }
  return { referrer: profile.referredBy };
}

/** Customer view: own code + friends referred. */
export async function getReferralSummary(userId: Id) {
  const cfg = await referralConfig();
  const code = cfg.enabled ? await ensureReferralCode(userId) : null;
  const friends = await CustomerProfile.find({ referredBy: userId })
    .select("user referralRewardedAt createdAt")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();
  return {
    ...cfg,
    code,
    friends: friends.map((f) => ({
      name: (f.user as unknown as { name?: string })?.name ?? "Customer",
      joinedAt: f.createdAt,
      rewarded: Boolean(f.referralRewardedAt),
    })),
  };
}

/** Super Admin view: every referral relationship. */
export async function listReferrals() {
  const rows = await CustomerProfile.find({ referredBy: { $exists: true, $ne: null } })
    .select("user referredBy referralRewardedAt createdAt customerCode")
    .populate("user", "name email mobile")
    .populate("referredBy", "name email mobile")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return rows;
}
