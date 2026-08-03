import { getOrdersForUser } from "@/lib/db/queries";
import { isOrderNextInRoute } from "@/lib/db/routes";
import { isDeliveryInRoute } from "@/lib/orders/tracking";

export async function hasDeliveryInRouteForUser(clerkUserId: string) {
  const orders = await getOrdersForUser(clerkUserId);

  for (const order of orders) {
    if (order.payment_status !== "paid") continue;

    const isNextInRoute = await isOrderNextInRoute(order.id, order.route_id);
    if (isDeliveryInRoute(order.order_status, order.fulfillment_type, { isNextInRoute })) {
      return true;
    }
  }

  return false;
}
