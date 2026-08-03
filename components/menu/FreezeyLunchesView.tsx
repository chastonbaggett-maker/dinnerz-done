"use client";

import { useEffect } from "react";
import type { DailyMenu, MenuItem } from "@/lib/types";
import { canOrderFromMenu } from "@/lib/orders/cutoff";
import { useCart } from "@/components/cart/CartProvider";
import { CutoffBanner } from "@/components/menu/CutoffBanner";
import { FreezeyLunchesSection } from "@/components/menu/FreezeyLunchesSection";
import { CartBar } from "@/components/cart/CartBar";
import { PageIcon } from "@/components/layout/PageIcon";
import { Badge } from "@/components/ui/badge";

interface FreezeyLunchesViewProps {
  menu: DailyMenu | null;
  items: MenuItem[];
  timezone: string;
}

export function FreezeyLunchesView({ menu, items, timezone }: FreezeyLunchesViewProps) {
  const { setMenuContext } = useCart();

  const orderingOpen = menu ? canOrderFromMenu(menu, timezone) : false;

  useEffect(() => {
    if (menu) setMenuContext(menu.id, menu.service_date);
  }, [menu, setMenuContext]);

  return (
    <>
      <div className="mx-auto w-full max-w-lg space-y-6 px-4 pb-36 pt-6">
        <div className="flex items-start gap-3">
          <PageIcon variant="freezey" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Freezey Lunches</h1>
            <p className="text-sm text-muted-foreground">Easy Lunches — add to your next delivery</p>
            <Badge variant="secondary" className="mt-2">
              $7.99 each
            </Badge>
          </div>
        </div>

        {menu ? (
          <CutoffBanner menu={menu} timezone={timezone} />
        ) : (
          <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
            Ordering is not open right now. Check back when the next menu is published.
          </p>
        )}

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            No Freezey Lunches available yet. Check back soon!
          </p>
        ) : (
          <FreezeyLunchesSection items={items} orderingOpen={orderingOpen} showHeader={false} />
        )}
      </div>

      <CartBar />
    </>
  );
}
