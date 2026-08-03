import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_TIMEZONE, isCutoffPassed, isOrderDay, isOrderingWeekday } from "@/lib/dates";
import type { DailyMenu } from "@/lib/types";

export function canOrderFromMenu(menu: DailyMenu, timezone?: string) {
  if (menu.status !== "published") return false;
  if (!isOrderingWeekday(timezone)) return false;
  return !isCutoffPassed(menu.order_cutoff_at, timezone);
}

/** True only on the day-before cutoff day when customers may add items. */
export function canPlaceOrderToday(menu: DailyMenu, timezone?: string) {
  if (!canOrderFromMenu(menu, timezone)) return false;
  return isOrderDay(menu.order_cutoff_at, timezone);
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
    const cutoffDay = formatInTimeZone(parseISO(menu.order_cutoff_at), timezone ?? DEFAULT_TIMEZONE, "EEEE");
    return `Ordering opens on ${cutoffDay}.`;
  }
  return null;
}
