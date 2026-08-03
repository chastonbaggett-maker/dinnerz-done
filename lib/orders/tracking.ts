import { addDays, format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE, getNow } from "@/lib/dates";
import type { FulfillmentType, OrderStatus } from "@/lib/types";

export const DELIVERY_TRACKING_STEPS = [
  {
    label: "Order received",
    description: "We've got your order — thank you!",
  },
  {
    label: "Purchasing your fresh ingredients",
    description: "Hand-picking the best produce for your meals",
  },
  {
    label: "Chefs in the kitchen",
    description: "Our kitchen is getting your meals ready",
  },
  {
    label: "Order in route",
    description: "Your driver is on the way",
  },
  {
    label: "Order arriving",
    description: "Almost at your door",
  },
] as const;

export type TrackingStepState = "completed" | "current" | "upcoming";

/** Service day milestones (business timezone). */
export const PURCHASING_START_HOUR = 10;
export const CHEFS_START_HOUR = 14;

export interface TrackingProgressContext {
  serviceDate?: string;
  createdAt?: string;
  timezone?: string;
  /** Driver route is active and this order is the next stop. */
  isNextInRoute?: boolean;
}

function getServiceDateString(context: TrackingProgressContext, timezone: string): string | null {
  if (context.serviceDate) return context.serviceDate;
  if (!context.createdAt) return null;

  const orderedDay = parseISO(formatInTimeZone(parseISO(context.createdAt), timezone, "yyyy-MM-dd"));
  return format(addDays(orderedDay, 1), "yyyy-MM-dd");
}

function getServiceDayTime(
  serviceDate: string,
  hour: number,
  minute: number,
  timezone: string
): Date {
  const [year, month, day] = serviceDate.split("-").map(Number);
  return fromZonedTime(new Date(year, month - 1, day, hour, minute, 0), timezone);
}

/** Steps 0–2 driven by service-day clock until the driver takes over. */
function getScheduledStepIndex(context: TrackingProgressContext, timezone: string): number {
  const serviceDate = getServiceDateString(context, timezone);
  if (!serviceDate) return 0;

  const now = getNow(timezone);
  const purchasingStart = getServiceDayTime(
    serviceDate,
    PURCHASING_START_HOUR,
    0,
    timezone
  );
  const chefsStart = getServiceDayTime(serviceDate, CHEFS_START_HOUR, 0, timezone);

  if (now < purchasingStart) return 0;
  if (now < chefsStart) return 1;
  return 2;
}

function getEffectiveDeliveryStepIndex(
  status: OrderStatus,
  context: TrackingProgressContext = {}
): number {
  const timezone = context.timezone ?? DEFAULT_TIMEZONE;

  if (status === "cancelled") return -1;
  if (status === "completed") return DELIVERY_TRACKING_STEPS.length;

  // Step 4 completes when the driver marks delivery complete (handled above).
  // Step 3: order is next on an active driver route.
  if (context.isNextInRoute) return 3;

  if (status === "out_for_delivery") {
    // On a route but not next yet — stay on kitchen step until driver queue reaches this order.
    return 2;
  }

  if (status === "preparing") return 2;

  if (status !== "received") return 0;

  return getScheduledStepIndex(context, timezone);
}

export function getTrackingStepStates(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
  context: TrackingProgressContext = {}
): TrackingStepState[] {
  if (fulfillmentType !== "delivery") {
    return [];
  }

  const currentIndex = getEffectiveDeliveryStepIndex(status, context);
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

/** "Chefs in the kitchen" step — drives the Order for tomorrow button pulse. */
export function isPreparingStepActive(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
  context: TrackingProgressContext = {}
) {
  const stepStates = getTrackingStepStates(status, fulfillmentType, context);
  return stepStates[2] === "current";
}

export function isTrackingComplete(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
  context: TrackingProgressContext = {}
) {
  if (fulfillmentType !== "delivery") {
    return status === "completed";
  }

  const stepStates = getTrackingStepStates(status, fulfillmentType, context);
  return stepStates.length > 0 && stepStates.every((state) => state === "completed");
}
