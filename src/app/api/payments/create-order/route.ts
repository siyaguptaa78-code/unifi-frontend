import { route, ok } from "@/lib/api";
import { createMembershipPaymentOrder } from "@/services/payment.service";

export const POST = route(
  async ({ user }) => {
    const orderData = await createMembershipPaymentOrder(user);
    return ok(orderData);
  },
  { roles: ["CUSTOMER"] }
);

