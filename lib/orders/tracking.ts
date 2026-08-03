import type { FulfillmentType, OrderStatus } from "@/lib/types";

export const DELIVERY_TRACKING_STEPS = [
  "Order received",
  "Order being prepared",
  "Order in route",
  "Order arriving",
] as const;

export type TrackingStepState = "completed" | "current" | "upcoming";

function getDeliveryStepIndex(status: OrderStatus): number {
  switch (status) {
    case "received":
      return 0;
    case "preparing":
      return 1;
    case "out_for_delivery":
      return 2;
    case "completed":
      return 4;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

export function getTrackingStepStates(
  status: OrderStatus,
  fulfillmentType: FulfillmentType
): TrackingStepState[] {
  if (fulfillmentType !== "delivery") {
    return [];
  }

  const currentIndex = getDeliveryStepIndex(status);
  if (currentIndex === -1) {
    return DELIVERY_TRACKING_STEPS.map(() => "upcoming");
  }

  return DELIVERY_TRACKING_STEPS.map((_, index) => {
    if (currentIndex >= DELIVERY_TRACKING_STEPS.length) return "completed";
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  });
}
