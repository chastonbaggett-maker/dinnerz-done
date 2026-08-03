"use client";

import type { DailyMenu } from "@/lib/types";
import { formatMenuDayLabel, formatMenuDayShort } from "@/lib/dates";
import { canPlaceOrderToday, getMenuPreviewState } from "@/lib/orders/cutoff";
import { cn } from "@/lib/utils";

interface MenuDatePickerProps {
  menus: DailyMenu[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  timezone: string;
  showLabel?: boolean;
}

export function MenuDatePicker({
  menus,
  selectedDate,
  onSelectDate,
  timezone,
  showLabel = true,
}: MenuDatePickerProps) {
  if (menus.length <= 1) return null;

  return (
    <div className="space-y-2">
      {showLabel && (
        <p className="text-sm font-medium text-muted-foreground">This week&apos;s menus</p>
      )}
      <div className="-mx-4 overflow-x-auto px-4 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3">
          {menus.map((menu) => {
            const isActive = menu.service_date === selectedDate;
            const previewState = getMenuPreviewState(menu, timezone);
            const orderable = canPlaceOrderToday(menu, timezone);
            const isClosed = previewState === "closed";

            return (
              <button
                key={menu.id}
                type="button"
                disabled={isClosed}
                onClick={() => onSelectDate(menu.service_date)}
                className={cn(
                  "flex min-w-[5.75rem] shrink-0 flex-col items-center rounded-xl border-2 px-5 py-3 text-center transition-[colors,box-shadow]",
                  isClosed &&
                    "cursor-default border-border/70 bg-muted/40 text-muted-foreground opacity-60",
                  !isClosed &&
                    orderable &&
                    (isActive
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                      : "border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"),
                  !isClosed &&
                    !orderable &&
                    (isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent),0_0_22px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                      : "border-primary/45 bg-card hover:border-primary hover:bg-primary/5")
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    isClosed && "text-muted-foreground",
                    !isClosed &&
                      orderable &&
                      (isActive ? "text-white" : "text-emerald-700 dark:text-emerald-300"),
                    !isClosed &&
                      !orderable &&
                      (isActive ? "text-primary-foreground" : "text-primary")
                  )}
                >
                  {formatMenuDayLabel(menu.service_date)}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isClosed && "text-muted-foreground",
                    !isClosed &&
                      orderable &&
                      (isActive ? "text-white/90" : "text-emerald-600/80 dark:text-emerald-400/80"),
                    !isClosed &&
                      !orderable &&
                      (isActive ? "text-primary-foreground/90" : "text-primary/70")
                  )}
                >
                  {formatMenuDayShort(menu.service_date)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
