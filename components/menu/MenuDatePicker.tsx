"use client";

import Link from "next/link";
import type { DailyMenu } from "@/lib/types";
import { formatMenuDayLabel, formatMenuDayShort } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface MenuDatePickerProps {
  menus: DailyMenu[];
  currentDate: string;
}

export function MenuDatePicker({ menus, currentDate }: MenuDatePickerProps) {
  if (menus.length <= 1) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">This week&apos;s menus</p>
      <div className="-mx-4 overflow-x-auto px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {menus.map((menu) => {
            const isActive = menu.service_date === currentDate;

            return (
              <Link
                key={menu.id}
                href={`/menu/${menu.service_date}`}
                className={cn(
                  "flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border-2 px-3 py-2 text-center transition-[colors,box-shadow]",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--primary)_55%,transparent),0_0_22px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                    : "border-primary/45 bg-card hover:border-primary hover:bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    isActive ? "text-primary-foreground" : "text-primary"
                  )}
                >
                  {formatMenuDayLabel(menu.service_date)}
                </span>
                <span className={cn("text-sm", isActive ? "text-primary-foreground/90" : "text-primary/70")}>
                  {formatMenuDayShort(menu.service_date)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
