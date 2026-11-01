import { route, ok, parseBody } from "@/lib/api";
import { paging, pageMeta, escapeRegex } from "@/lib/query";
import { User, Membership, CustomerProfile, MembershipCard, PointsLedger } from "@/models";
import { adminCreateCustomerSchema } from "@/lib/validators";
import { hashPassword, generateCustomerCode } from "@/services/auth.service";
import { ensureDigitalCard } from "@/services/membership.service";
import { logAudit } from "@/services/audit.service";
import { withTransaction } from "@/lib/db";
import { Errors } from "@/lib/errors";

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

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, adminCreateCustomerSchema);
    const email = input.email.toLowerCase();

    const [emailTaken, mobileTaken] = await Promise.all([
      User.exists({ email }),
      User.exists({ mobile: input.mobile }),
    ]);
    if (emailTaken) throw Errors.conflict("An account with this email already exists", { field: "email" });
    if (mobileTaken) throw Errors.conflict("An account with this mobile number already exists", { field: "mobile" });

    const passwordHash = await hashPassword(input.password || "Customer@12345");
    const customerCode = await generateCustomerCode();

    const created = await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const [newUser] = await User.create(
        [
          {
            name: input.name,
            email,
            mobile: input.mobile,
            passwordHash,
            role: "CUSTOMER",
            status: input.status,
          },
        ],
        opts
      );

      await CustomerProfile.create([{ user: newUser._id, customerCode }], opts);

      const memStatus = input.initialPoints > 0 || input.initialHours > 0 ? "ACTIVE" : "INACTIVE";
      const remainingMin = Math.round(input.initialHours * 60);

      const [membership] = await Membership.create(
        [
          {
            customer: newUser._id,
            status: memStatus,
            pointsBalance: input.initialPoints,
            totalPointsCredited: input.initialPoints,
            remainingMinutes: remainingMin,
            activatedAt: memStatus === "ACTIVE" ? new Date() : undefined,
          },
        ],
        opts
      );

      if (input.initialPoints > 0) {
        await PointsLedger.create(
          [
            {
              customer: newUser._id,
              membership: membership._id,
              type: "CREDIT",
              points: input.initialPoints,
              balanceAfter: input.initialPoints,
              source: "ADMIN",
              reference: `ADMIN-INIT-${Date.now()}`,
              description: "Initial points granted upon administrative customer creation",
              performedBy: user.id,
            },
          ],
          opts
        );
      }

      const card = await ensureDigitalCard(newUser._id, session);

      return { user: newUser, membership, customerCode, card };
    });

    await logAudit(
      user,
      "CUSTOMER_CREATED_BY_ADMIN",
      "User",
      created.user._id,
      { email, code: created.customerCode, points: input.initialPoints, hours: input.initialHours },
      { ip }
    );

    return ok(created, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "customers.manage" }
);
