"use client";

import Link from "next/link";
import { ArrowRight, Snowflake, UtensilsCrossed } from "lucide-react";
import type { DailyMenu } from "@/lib/types";
import { formatServiceDate, getOrderWindowBadgeState } from "@/lib/dates";
import { canOrderFromMenu } from "@/lib/orders/cutoff";
import { buttonVariants } from "@/components/ui/button";
import { CutoffCountdown } from "@/components/menu/CutoffCountdown";
import { OrderWindowBadge } from "@/components/menu/order-window-badge";
import { cn } from "@/lib/utils";

interface HomeViewProps {
  businessName: string;
  menu: DailyMenu | null;
  timezone: string;
  frozenEnabled: boolean;
}

export function HomeView({ businessName, menu, timezone, frozenEnabled }: HomeViewProps) {
  const orderingOpen = menu ? canOrderFromMenu(menu, timezone) : false;
  const badge = menu
    ? getOrderWindowBadgeState(menu.order_cutoff_at, orderingOpen, timezone)
    : null;

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 px-4 pb-36 pt-8">
      <section className="space-y-3">
        <p className="text-sm font-medium text-primary">{businessName}</p>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">
          Dinner delivered.<br />Order Now for tomorrow.
        </h1>
        <p className="text-muted-foreground">
          Fresh home-cooked meals to your door — plus freezer-ready lunches you can add to any order.
        </p>
      </section>

      {menu && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Next delivery</p>
              <p className="text-xl font-semibold">{formatServiceDate(menu.service_date)}</p>
            </div>
            {badge && <OrderWindowBadge label={badge.label} tone={badge.tone} />}
          </div>
          <p
            className={cn(
              "mt-2 text-sm",
              badge?.tone === "active" ? "font-medium text-emerald-600" : "text-muted-foreground"
            )}
          >
            <CutoffCountdown cutoffAt={menu.order_cutoff_at} timezone={timezone} />
          </p>
        </div>
      )}

      <section className="grid gap-4">
        <Link
          href="/menu"
          className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UtensilsCrossed className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Tomorrow&apos;s Menu</h2>
            <p className="text-sm text-muted-foreground">
              Browse dinners, customize your order, and pick a delivery window.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        {frozenEnabled && (
          <Link
            href="/freezey-lunches"
            className="group flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-5 transition-colors hover:bg-sky-50 dark:border-sky-900 dark:bg-sky-950/20"
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900">
              <Snowflake className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Freezey Lunches</h2>
              <p className="text-sm text-muted-foreground">
                Easy Lunches — freezer-ready add-ons at $7.99. Pair with your dinner delivery.
              </p>
            </div>
            <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </section>

      {menu && orderingOpen && (
        <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "h-14 w-full text-base")}>
          Order now
        </Link>
      )}

      {!menu && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          No menu is available for ordering right now. Check back soon!
        </p>
      )}
    </div>
  );
}
