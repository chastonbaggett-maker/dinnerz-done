import { addDays, format, parseISO, setHours, setMinutes, setSeconds } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "America/Chicago";

/** Demo-only: pretend today is this date (yyyy-MM-dd) at 2 PM in business timezone. */
export function getNow(timezone = DEFAULT_TIMEZONE): Date {
  const demoToday = process.env.NEXT_PUBLIC_DEMO_TODAY ?? process.env.DEMO_TODAY;
  if (demoToday && /^\d{4}-\d{2}-\d{2}$/.test(demoToday)) {
    const [year, month, day] = demoToday.split("-").map(Number);
    return fromZonedTime(new Date(year, month - 1, day, 14, 0, 0), timezone);
  }
  return new Date();
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

/** Tue–Fri menu dates: starts tomorrow, skipping Monday if needed. */
export function getWeekdayMenuDates(count: number, timezone = DEFAULT_TIMEZONE) {
  let start = parseISO(getTomorrowDateString(timezone));
  if (format(start, "EEEE") === "Monday") {
    start = addDays(start, 1);
  }
  return Array.from({ length: count }, (_, index) => format(addDays(start, index), "yyyy-MM-dd"));
}

/** Upcoming service dates starting tomorrow (default: Mon–Fri week). */
export function getUpcomingMenuDates(count = 5, timezone = DEFAULT_TIMEZONE) {
  const start = parseISO(getTomorrowDateString(timezone));
  return Array.from({ length: count }, (_, index) => format(addDays(start, index), "yyyy-MM-dd"));
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

export function getDefaultCutoff(
  serviceDate: string,
  hour: number,
  minute: number,
  timezone = DEFAULT_TIMEZONE
) {
  const service = parseISO(serviceDate);
  const dayBefore = addDays(service, -1);
  const zoned = toZonedTime(dayBefore, timezone);
  const cutoff = setSeconds(setMinutes(setHours(zoned, hour), minute), 0);
  return cutoff.toISOString();
}

export function isCutoffPassed(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  const now = toZonedTime(getNow(), timezone);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  return now >= cutoff;
}

export function formatCutoffCountdownAt(
  cutoffAt: string,
  timezone = DEFAULT_TIMEZONE,
  elapsedMs = 0
) {
  const demoToday = process.env.NEXT_PUBLIC_DEMO_TODAY ?? process.env.DEMO_TODAY;
  const now = demoToday
    ? toZonedTime(new Date(getNow(timezone).getTime() + elapsedMs), timezone)
    : toZonedTime(new Date(), timezone);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  const diffMs = cutoff.getTime() - now.getTime();

  if (diffMs <= 0) return "Ordering closed";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours >= 24) {
    return `Order by ${formatInTimeZone(cutoff, timezone, "EEE, MMM d 'at' h:mm a")}`;
  }
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s left to order`;
  if (minutes > 0) return `${minutes}m ${seconds}s left to order`;
  return `${seconds}s left to order`;
}

export function formatCutoffCountdown(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  return formatCutoffCountdownAt(cutoffAt, timezone, 0);
}

/** True when today is the day-before cutoff day (when customers can place orders). */
export function isOrderDay(cutoffAt: string, timezone = DEFAULT_TIMEZONE) {
  const now = toZonedTime(getNow(), timezone);
  const cutoff = toZonedTime(parseISO(cutoffAt), timezone);
  return format(now, "yyyy-MM-dd") === format(cutoff, "yyyy-MM-dd");
}

/** Orders are accepted Mon–Thu only (not Fri/Sat/Sun) in business timezone. */
export function isOrderingWeekday(timezone = DEFAULT_TIMEZONE) {
  const day = toZonedTime(getNow(), timezone).getDay();
  return day >= 1 && day <= 4;
}

export type OrderWindowBadgeTone = "active" | "upcoming" | "closed";

export function getOrderWindowBadgeState(
  cutoffAt: string,
  orderingOpen: boolean,
  timezone = DEFAULT_TIMEZONE
): { label: string; tone: OrderWindowBadgeTone } {
  if (!isOrderingWeekday(timezone)) {
    return { label: "Orders open Mon–Thu", tone: "closed" };
  }

  if (!orderingOpen) {
    return { label: "Day-before orders only", tone: "closed" };
  }

  if (isOrderDay(cutoffAt, timezone)) {
    return { label: "Open to Order", tone: "active" };
  }

  const cutoffDay = formatInTimeZone(parseISO(cutoffAt), timezone, "EEEE");
  const cutoffTime = formatInTimeZone(parseISO(cutoffAt), timezone, "h:mm a");
  return { label: `Order ${cutoffDay} by ${cutoffTime}`, tone: "upcoming" };
}

/** @deprecated Use getOrderWindowBadgeState */
export function formatOrderWindowBadge(cutoffAt: string, orderingOpen: boolean, timezone = DEFAULT_TIMEZONE) {
  return getOrderWindowBadgeState(cutoffAt, orderingOpen, timezone).label;
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
