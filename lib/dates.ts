import { addDays, format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "America/Chicago";
export const DEFAULT_ORDER_CUTOFF_HOUR = 20;
export const DEFAULT_ORDER_CUTOFF_MINUTE = 0;

export function getNow(_timezone = DEFAULT_TIMEZONE): Date {
  return new Date();
}

export function getBusinessNow(timezone = DEFAULT_TIMEZONE, elapsedMs = 0): Date {
  return toZonedTime(new Date(Date.now() + elapsedMs), timezone);
}

export function formatServiceDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d");
}

export function formatShortDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function getTomorrowDateString(timezone = DEFAULT_TIMEZONE) {
  const now = toZonedTime(getNow(), timezone);
  const tomorrow = addDays(now, 1);
  return format(tomorrow, "yyyy-MM-dd");
}

export function getTodayDateString(timezone = DEFAULT_TIMEZONE) {
  return formatInTimeZone(getNow(timezone), timezone, "yyyy-MM-dd");
}

export function isServiceDay(serviceDate: string, timezone = DEFAULT_TIMEZONE) {
  return getTodayDateString(timezone) === serviceDate;
}

/** Upcoming service dates starting tomorrow (default: Mon–Fri week). */
export function getUpcomingMenuDates(count = 5, timezone = DEFAULT_TIMEZONE) {
  const start = parseISO(getTomorrowDateString(timezone));
  return Array.from({ length: count }, (_, index) => format(addDays(start, index), "yyyy-MM-dd"));
}

/** @deprecated Use getUpcomingMenuDates */
export function getWeekdayMenuDates(count: number, timezone = DEFAULT_TIMEZONE) {
  return getUpcomingMenuDates(count, timezone);
}

/** Service dates starting N days after tomorrow (e.g. offset 1 = day after tomorrow). */
export function getUpcomingMenuDatesAfterTomorrow(
  daysAfterTomorrow: number,
  count: number,
  timezone = DEFAULT_TIMEZONE
) {
  const start = addDays(parseISO(getTomorrowDateString(timezone)), daysAfterTomorrow);
  return Array.from({ length: count }, (_, index) => format(addDays(start, index), "yyyy-MM-dd"));
}

export function formatMenuDayLabel(date: string) {
  return format(parseISO(date), "EEE");
}

export function formatMenuDayShort(date: string) {
  return format(parseISO(date), "MMM d");
}

/** Cutoff is 8:00 PM on the day before the service date (in business timezone). */
export function getDefaultCutoff(
  serviceDate: string,
  hour = DEFAULT_ORDER_CUTOFF_HOUR,
  minute = DEFAULT_ORDER_CUTOFF_MINUTE,
  timezone = DEFAULT_TIMEZONE
) {
  const dayBefore = format(addDays(parseISO(serviceDate), -1), "yyyy-MM-dd");
  const [year, month, day] = dayBefore.split("-").map(Number);
  return fromZonedTime(new Date(year, month - 1, day, hour, minute, 0), timezone).toISOString();
}

export function isCutoffPassed(cutoffAt: string, timezone = DEFAULT_TIMEZONE, elapsedMs = 0) {
  const now = getBusinessNow(timezone, elapsedMs);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  return now >= cutoff;
}

export function getOrderDayStart(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  const start = new Date(cutoff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function formatDurationCountdown(diffMs: number) {
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h ${minutes}m`;
  }
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatMenuOpensOnDay(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  const orderDay = formatInTimeZone(parseISO(cutoffAt), timezone, "EEEE");
  return `Menu opens on ${orderDay}`;
}

export function formatCutoffCountdownAt(
  cutoffAt: string,
  timezone = DEFAULT_TIMEZONE,
  elapsedMs = 0,
  options?: { compact?: boolean }
) {
  const now = getBusinessNow(timezone, elapsedMs);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);

  if (now >= cutoff) return "Ordering closed";

  if (!isOrderDay(cutoffAt, timezone, elapsedMs)) {
    const opensAt = getOrderDayStart(cutoffAt, timezone);
    const diffMs = opensAt.getTime() - now.getTime();
    if (diffMs <= 0) return "Ordering opens soon";
    return `Opens in ${formatDurationCountdown(diffMs)}`;
  }

  const diffMs = cutoff.getTime() - now.getTime();
  if (options?.compact) return formatDurationCountdown(diffMs);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s left to order by 8:00 PM`;
  if (minutes > 0) return `${minutes}m ${seconds}s left to order by 8:00 PM`;
  return `${seconds}s left to order by 8:00 PM`;
}

export function formatCutoffCountdown(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  return formatCutoffCountdownAt(cutoffAt, timezone, 0);
}

/** True when today is the day-before cutoff day (when customers can place orders). */
export function isOrderDay(cutoffAt: string, timezone = DEFAULT_TIMEZONE, elapsedMs = 0) {
  const now = getBusinessNow(timezone, elapsedMs);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  return format(now, "yyyy-MM-dd") === format(cutoff, "yyyy-MM-dd");
}

/** Orders are accepted Mon–Thu only (not Fri/Sat/Sun) in business timezone. */
export function isOrderingWeekday(timezone = DEFAULT_TIMEZONE, elapsedMs = 0) {
  const day = getBusinessNow(timezone, elapsedMs).getDay();
  return day >= 1 && day <= 4;
}

export type OrderWindowBadgeTone = "active" | "upcoming" | "closed";

export function getOrderWindowBadgeState(
  cutoffAt: string,
  timezone = DEFAULT_TIMEZONE,
  elapsedMs = 0
): { label: string; tone: OrderWindowBadgeTone } {
  if (isCutoffPassed(cutoffAt, timezone, elapsedMs)) {
    return { label: "Ordering closed", tone: "closed" };
  }

  if (!isOrderingWeekday(timezone, elapsedMs)) {
    return { label: "Orders open Mon–Thu", tone: "closed" };
  }

  if (isOrderDay(cutoffAt, timezone, elapsedMs)) {
    return { label: "Open to Order", tone: "active" };
  }

  const orderDay = formatInTimeZone(parseISO(cutoffAt), timezone, "EEEE");
  return { label: `Opens ${orderDay}`, tone: "upcoming" };
}

/** @deprecated Use getOrderWindowBadgeState */
export function formatOrderWindowBadge(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  return getOrderWindowBadgeState(cutoffAt, timezone).label;
}

/** e.g. "Order by 8:00 PM" */
export function formatOrderByDeadline(_cutoffAt: string, _timezone = DEFAULT_TIMEZONE) {
  return "Order by 8:00 PM";
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
