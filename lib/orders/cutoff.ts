import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_TIMEZONE, isCutoffPassed, isOrderDay, isOrderingWeekday } from "@/lib/dates";
import type { DailyMenu } from "@/lib/types";

/** True when this menu's order window is open now (order day, Mon–Thu, before 8 PM cutoff). */
export function canOrderFromMenu(menu: DailyMenu, timezone?: string) {
  if (menu.status !== "published") return false;
  if (!isOrderingWeekday(timezone)) return false;
  if (isCutoffPassed(menu.order_cutoff_at, timezone)) return false;
  return isOrderDay(menu.order_cutoff_at, timezone);
}

/** Alias for canOrderFromMenu — menus open the day before service until 8 PM. */
export function canPlaceOrderToday(menu: DailyMenu, timezone?: string) {
  return canOrderFromMenu(menu, timezone);
}

export type MenuPreviewState = "orderable" | "closed" | "preview";

export function getMenuPreviewState(menu: DailyMenu, timezone?: string): MenuPreviewState {
  if (menu.status === "closed" || isCutoffPassed(menu.order_cutoff_at, timezone)) {
    return "closed";
  }
  if (canPlaceOrderToday(menu, timezone)) {
    return "orderable";
  }
  return "preview";
}

/** Default menu date: orderable now, else closest upcoming preview, else first available. */
export function getPreferredMenuDate(menus: DailyMenu[], timezone?: string) {
  const orderable = menus.find((menu) => canPlaceOrderToday(menu, timezone));
  if (orderable) return orderable.service_date;

  const upcoming = menus.find((menu) => getMenuPreviewState(menu, timezone) === "preview");
  if (upcoming) return upcoming.service_date;

  return menus[0]?.service_date ?? "";
}

export function getMenuOrderBlockReason(menu: DailyMenu, timezone?: string) {
  if (menu.status === "draft") return "This menu is not available yet.";
  if (menu.status === "closed") return "Ordering for this date has closed.";
  if (!isOrderingWeekday(timezone)) {
    return "Ordering is open Monday through Thursday only.";
  }
  if (isCutoffPassed(menu.order_cutoff_at, timezone)) {
    return "The ordering cutoff has passed for this menu.";
  }
  if (!isOrderDay(menu.order_cutoff_at, timezone)) {
    const orderDay = formatInTimeZone(parseISO(menu.order_cutoff_at), timezone ?? DEFAULT_TIMEZONE, "EEEE");
    return `Ordering opens on ${orderDay}.`;
  }
  return null;
}
