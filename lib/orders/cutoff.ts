import { isCutoffPassed, isOrderingWeekday } from "@/lib/dates";
import type { DailyMenu } from "@/lib/types";

export function canOrderFromMenu(menu: DailyMenu, timezone?: string) {
  if (menu.status !== "published") return false;
  if (!isOrderingWeekday(timezone)) return false;
  return !isCutoffPassed(menu.order_cutoff_at, timezone);
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
  return null;
}
