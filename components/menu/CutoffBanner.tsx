import { Clock } from "lucide-react";
import { formatServiceDate, getOrderWindowBadgeState } from "@/lib/dates";
import { canOrderFromMenu } from "@/lib/orders/cutoff";
import type { DailyMenu } from "@/lib/types";
import { CutoffCountdown } from "@/components/menu/CutoffCountdown";
import { OrderWindowBadge } from "@/components/menu/order-window-badge";
import { cn } from "@/lib/utils";

interface CutoffBannerProps {
  menu: DailyMenu;
  timezone: string;
}

export function CutoffBanner({ menu, timezone }: CutoffBannerProps) {
  const orderingOpen = canOrderFromMenu(menu, timezone);
  const badge = getOrderWindowBadgeState(menu.order_cutoff_at, orderingOpen, timezone);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Menu for {formatServiceDate(menu.service_date)}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Always next day delivery</p>
          <p className="mt-1 text-sm text-muted-foreground">
            If you have a dinner coming tomorrow, they will be delivered together.
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
