import { route, ok, parseBody } from "@/lib/api";
import { franchiseSchema } from "@/lib/validators";
import { Franchise, Cafe } from "@/models";
import { logAudit } from "@/services/audit.service";

export const GET = route(
  async ({ user }) => {
    let match: Record<string, unknown> = {};
    if (user.role === "FRANCHISE_OWNER") {
      match = { owner: user.id };
    } else if (user.role === "SUPERVISOR") {
      match = { supervisor: user.id };
    }

    const franchises = await Franchise.find(match)
      .populate("owner", "name email mobile")
      .populate("supervisor", "name email mobile")
      .populate("package", "name amount cafeSize")
      .sort({ createdAt: -1 })
      .lean();

    const fIds = franchises.map((f) => f._id);
    const cafes = await Cafe.find({ franchise: { $in: fIds } }).select("name code franchise status").lean();
    const cafeMap = new Map<string, any[]>();
    for (const c of cafes) {
      const k = String(c.franchise);
      if (!cafeMap.has(k)) cafeMap.set(k, []);
      cafeMap.get(k)!.push(c);
    }

    const rows = franchises.map((f) => ({
      ...f,
      cafes: cafeMap.get(String(f._id)) || [],
    }));

    return ok(rows);
  },
  { roles: ["SUPER_ADMIN", "SUPERVISOR", "FRANCHISE_OWNER"] }
);

export const POST = route(
  async ({ req, user, ip }) => {
    const input = await parseBody(req, franchiseSchema);
    const franchise = await Franchise.create({
      ...input,
      owner: input.owner || undefined,
      supervisor: input.supervisor || undefined,
      approvedBy: input.status === "ACTIVE" || input.status === "APPROVED" ? user.id : undefined,
      approvedAt: input.status === "ACTIVE" || input.status === "APPROVED" ? new Date() : undefined,
    });

    await logAudit(user, "FRANCHISE_CREATED", "Franchise", franchise._id, { name: franchise.name, code: franchise.code }, { ip });
    return ok(franchise, undefined, 201);
  },
  { roles: ["SUPER_ADMIN"], permission: "franchises.manage" }
);

