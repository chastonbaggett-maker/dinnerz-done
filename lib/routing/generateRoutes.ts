import type { Order } from "@/lib/types";

/** Simple address clustering by normalized street prefix for route grouping */
export function addressClusterKey(address: string | null | undefined) {
  if (!address) return "unknown";
  const normalized = address.toLowerCase().trim();
  const parts = normalized.split(/[,\s]+/);
  return parts.slice(0, 2).join("-") || normalized.slice(0, 20);
}

export interface RoutableOrder extends Order {}

export interface GeneratedRoute {
  driverIndex: number;
  orders: RoutableOrder[];
}

/**
 * Generate optimized routes:
 * 1. Group orders by delivery time slot
 * 2. Within each slot, cluster by address prefix
 * 3. Distribute clusters round-robin across drivers to balance load
 */
export function generateRoutes(orders: RoutableOrder[], driverCount: number): GeneratedRoute[] {
  if (driverCount < 1) driverCount = 1;

  const deliveryOrders = orders.filter(
    (o) => o.fulfillment_type === "delivery" && o.payment_status === "paid"
  );

  const routes: GeneratedRoute[] = Array.from({ length: driverCount }, (_, i) => ({
    driverIndex: i,
    orders: [],
  }));

  // Sort by slot start, then premium requested time, then address
  const sorted = [...deliveryOrders].sort((a, b) => {
    const slotA = a.delivery_slot?.window_start ?? "99:99";
    const slotB = b.delivery_slot?.window_start ?? "99:99";
    if (slotA !== slotB) return slotA.localeCompare(slotB);

    const timeA = a.requested_delivery_time ?? "";
    const timeB = b.requested_delivery_time ?? "";
    if (timeA !== timeB) return timeA.localeCompare(timeB);

    return addressClusterKey(a.delivery_address).localeCompare(
      addressClusterKey(b.delivery_address)
    );
  });

  // Group into clusters by slot + address cluster
  const clusters: RoutableOrder[][] = [];
  let current: RoutableOrder[] = [];
  let currentKey = "";

  for (const order of sorted) {
    const key = `${order.delivery_slot?.window_start ?? "x"}|${addressClusterKey(order.delivery_address)}`;
    if (key !== currentKey && current.length > 0) {
      clusters.push(current);
      current = [];
    }
    currentKey = key;
    current.push(order);
  }
  if (current.length > 0) clusters.push(current);

  // Assign clusters round-robin to drivers (balance stop count)
  clusters.forEach((cluster, i) => {
    const driverIdx = i % driverCount;
    routes[driverIdx].orders.push(...cluster);
  });

  return routes;
}

export function calculateDriverPay(stopCount: number, feePerDeliveryCents: number) {
  return stopCount * feePerDeliveryCents;
}
