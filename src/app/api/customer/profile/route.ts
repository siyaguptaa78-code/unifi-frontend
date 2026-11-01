import { route, ok, parseBody } from "@/lib/api";
import { profileSchema } from "@/lib/validators";
import { User, CustomerProfile } from "@/models";
import { Errors } from "@/lib/errors";

export const GET = route(
  async ({ user }) => {
    const [u, p] = await Promise.all([
      User.findById(user.id).select("name email mobile createdAt").lean(),
      CustomerProfile.findOne({ user: user.id }).populate("preferredCafe", "name code address").lean(),
    ]);
    if (!u) throw Errors.notFound("User");
    return ok({ user: u, profile: p });
  },
  { roles: ["CUSTOMER"] }
);

export const PUT = route(
  async ({ req, user }) => {
    const input = await parseBody(req, profileSchema);

    // Update User name & mobile
    await User.findByIdAndUpdate(user.id, {
      name: input.name,
      mobile: input.mobile,
    });

    // Update CustomerProfile
    const profile = await CustomerProfile.findOneAndUpdate(
      { user: user.id },
      {
        gender: input.gender,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        address: input.address,
        preferredCafe: input.preferredCafe || undefined,
        marketingOptIn: input.marketingOptIn,
      },
      { upsert: true, new: true }
    );

    return ok({ profile, message: "Profile updated successfully" });
  },
  { roles: ["CUSTOMER"] }
);

