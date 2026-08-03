import { Clock } from "lucide-react";
import { formatOrderByDeadline, formatServiceDate, getOrderWindowBadgeState } from "@/lib/dates";
import { canOrderFromMenu } from "@/lib/orders/cutoff";
import type { DailyMenu } from "@/lib/types";
import { CutoffCountdown } from "@/components/menu/CutoffCountdown";
import { OrderWindowBadge } from "@/components/menu/order-window-badge";
import { cn } from "@/lib/utils";

interface CutoffBannerProps {
  menu: DailyMenu;
  timezone: string;
  /** Override the default "Menu for {date}" heading */
  heading?: string;
  /** Override the default "Always next day delivery" subheading */
  subheading?: string;
}

export function CutoffBanner({ menu, timezone, heading, subheading }: CutoffBannerProps) {
  const orderingOpen = canOrderFromMenu(menu, timezone);
  const badge = getOrderWindowBadgeState(menu.order_cutoff_at, orderingOpen, timezone);
  const defaultSubheading =
    badge.tone === "active"
      ? formatOrderByDeadline(menu.order_cutoff_at, timezone)
      : "Always next day delivery";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        badge.tone === "active"
          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {heading ?? `Menu for ${formatServiceDate(menu.service_date)}`}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {subheading ?? defaultSubheading}
          </p>
        </div>
        <OrderWindowBadge label={badge.label} tone={badge.tone} />
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-2 text-sm",
          badge.tone === "active" ? "font-medium text-emerald-600" : "text-muted-foreground"
        )}
      >
        <Clock className="size-4 shrink-0" />
        <CutoffCountdown cutoffAt={menu.order_cutoff_at} timezone={timezone} />
      </div>
    </div>
  );
}
