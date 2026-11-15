/** Core business constants. Runtime-tunable values live in SystemSetting (see settings.service). */
export const MEMBERSHIP_PRICE_INR = 5000;
export const POINTS_PER_RECHARGE = 5000;
export const HOURS_PER_RECHARGE = 150;
export const MINUTES_PER_RECHARGE = HOURS_PER_RECHARGE * 60;
export const POINT_VALUE_INR = 1;

export const DEFAULT_SETTINGS = {
  "membership.price": { value: MEMBERSHIP_PRICE_INR, description: "Membership / recharge price in INR" },
  "membership.points": { value: POINTS_PER_RECHARGE, description: "Points credited per successful recharge" },
  "membership.hours": { value: HOURS_PER_RECHARGE, description: "Membership hours set on each successful recharge" },
  "alerts.lowPointsThreshold": { value: 500, description: "Notify customer when points fall below this value" },
  "alerts.lowHoursThreshold": { value: 10, description: "Notify customer when remaining hours fall below this value" },
  "visits.duplicateTapSeconds": { value: 30, description: "Ignore repeated card taps within this many seconds" },
  "orders.customerCancelStatuses": { value: ["PENDING"], description: "Order statuses in which a customer may self-cancel" },
  "orders.refundPolicy": {
    value: "FULL_REFUND_BEFORE_COMPLETION",
    description: "Cancelled orders (before completion) are refunded in full to the points wallet. PENDING CLIENT APPROVAL.",
  },
  "orders.preOrdersEnabled": {
    value: true,
    description: "Global toggle for allowing online pre-orders from outside the cafe",
  },
  "orders.defaultPickupSlots": {
    value: ["15-20 mins", "30 mins", "45 mins", "1 hour", "1.5 hours"],
    description: "Available pre-order customer arrival time slot options",
  },
  "website.heroHeadline": {
    value: "India's Premier Cafe & Co-Working Membership Club",
    description: "Primary headline displayed on the public homepage",
  },
  "website.heroSubtitle": {
    value: "Recharge ₹5,000 for 5,000 Points & 150 Hours of Cafe Access across all prime locations.",
    description: "Subtitle copy for public marketing pages",
  },
  "website.announcementActive": {
    value: true,
    description: "Toggle visibility of top marketing announcement banner",
  },
  "website.announcementBanner": {
    value: "🎉 New branches live in Indiranagar & Koramangala! Pre-order online before arrival.",
    description: "Text content for the global top banner",
  },
  "website.promoCode": {
    value: "WELCOME2026",
    description: "Featured promotional code displayed to prospective customers",
  },
  "website.promoText": {
    value: "Special introductory offer: Get 5,000 points + 150 hours of premium cafe time.",
    description: "Marketing copy accompanying promotional code",
  },
  "platform.maintenanceMode": {
    value: false,
    description: "Emergency platform maintenance flag",
  },
  "membership.plans": {
    value: [
      { amount: 500, points: 500, hours: 0 },
      { amount: 3000, points: 3000, hours: 150 },
      { amount: 5000, points: 5000, hours: 150 },
    ] as readonly RechargePlan[],
    description:
      'Recharge plans offered to customers. JSON list of {"amount":₹,"points":n,"hours":n}. Plans with hours > 0 reset the hours balance; plans with 0 hours only add points.',
  },
  "referral.enabled": { value: false, description: "Refer & Earn programme on/off (Super Admin only)" },
  "referral.referrerPoints": { value: 250, description: "Points credited to the referrer when the referred friend completes their first recharge" },
  "referral.refereePoints": { value: 250, description: "Points credited to the new customer on their first recharge when they joined with a referral code" },
  "visits.otpRequired": { value: true, description: "Require a one-time password (sent to the customer) to confirm every cafe entry and exit" },
  "books.returnDeductions": {
    value: [20, 40, 60, 80] as readonly number[],
    description:
      "Book buy-back policy: % of the price kept when a book is returned within month 1, 2, 3, 4… After the last month the book cannot be returned (it is the customer's / donated).",
  },
  "trending.limit": { value: 6, description: "Number of Trendy Food items to highlight (most ordered in the last 30 days, plus manually pinned items)" },
  "trending.windowDays": { value: 30, description: "Look-back window in days used to rank Trendy Food by order volume" },
} as const;

export type RechargePlan = { amount: number; points: number; hours: number };

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

