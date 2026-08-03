import type { DeliveryTimeSlot } from "@/lib/types";

export function formatTimeSlot(slot: DeliveryTimeSlot) {
  const start = slot.window_start.slice(0, 5);
  const end = slot.window_end.slice(0, 5);
  return formatWindow(start, end);
}

export function formatWindow(start: string, end: string) {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

export function formatTime12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function getOverallDeliveryWindow(slots: DeliveryTimeSlot[]) {
  if (slots.length === 0) return null;

  const startMinutes = Math.min(...slots.map((slot) => parseTimeToMinutes(slot.window_start.slice(0, 5))));
  const endMinutes = Math.max(...slots.map((slot) => parseTimeToMinutes(slot.window_end.slice(0, 5))));

  return {
    startMinutes,
    endMinutes,
    start: minutesToTimeString(startMinutes),
    end: minutesToTimeString(endMinutes),
  };
}

export function generatePremiumTimeOptions(slots: DeliveryTimeSlot[], stepMinutes = 15) {
  const window = getOverallDeliveryWindow(slots);
  if (!window) return [];

  const options: string[] = [];
  for (let minutes = window.startMinutes; minutes <= window.endMinutes; minutes += stepMinutes) {
    options.push(minutesToTimeString(minutes));
  }
  return options;
}

export function findSlotForTime(slots: DeliveryTimeSlot[], time: string) {
  const minutes = parseTimeToMinutes(time.slice(0, 5));
  return (
    slots.find((slot) => {
      const start = parseTimeToMinutes(slot.window_start.slice(0, 5));
      const end = parseTimeToMinutes(slot.window_end.slice(0, 5));
      return minutes >= start && minutes <= end;
    }) ?? null
  );
}

export function slotHasCapacity(slot: DeliveryTimeSlot) {
  return slot.order_count < slot.max_orders;
}

export function formatOrderNumber(orderNumber: number | null, _serviceDate?: string) {
  if (!orderNumber) return "—";
  return orderNumber.toString().padStart(3, "0");
}

export function generateDefaultSlots(
  serviceDate: string,
  startHour: number,
  endHour: number,
  durationMinutes: number,
  maxOrders = 25
): Omit<DeliveryTimeSlot, "id" | "order_count">[] {
  const slots: Omit<DeliveryTimeSlot, "id" | "order_count">[] = [];
  let cursor = startHour * 60;
  const end = endHour * 60;

  while (cursor + durationMinutes <= end) {
    const startH = Math.floor(cursor / 60);
    const startM = cursor % 60;
    const endCursor = cursor + durationMinutes;
    const endH = Math.floor(endCursor / 60);
    const endM = endCursor % 60;

    slots.push({
      service_date: serviceDate,
      window_start: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}:00`,
      window_end: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}:00`,
      max_orders: maxOrders,
    });
    cursor += durationMinutes;
  }

  return slots;
}

export function buildRequestedDeliveryTime(
  serviceDate: string,
  timeValue: string,
  timezone: string
): string {
  // timeValue is HH:mm from input
  return `${serviceDate}T${timeValue}:00`;
}
