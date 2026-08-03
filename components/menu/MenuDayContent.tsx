"use client";

import type { DailyMenuItem } from "@/lib/types";
import { canPlaceOrderToday } from "@/lib/orders/cutoff";
import { filterItemsByMenuVariant, type MenuVariant } from "@/lib/menu-dietary";
import { MenuCard } from "@/components/menu/MenuCard";

interface MenuDayContentProps {
  items: DailyMenuItem[];
  menuVariant: MenuVariant;
  orderingOpen: boolean;
  onCustomize: (item: DailyMenuItem) => void;
}

export function MenuDayContent({
  items,
  menuVariant,
  orderingOpen,
  onCustomize,
}: MenuDayContentProps) {
  const visibleItems = filterItemsByMenuVariant(items, menuVariant);

  return (
    <div className="space-y-4">
      {visibleItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          {menuVariant === "dairy-free"
            ? "No dairy-free items on this menu. Try the standard menu."
            : "No items on this menu yet. Check back soon."}
        </p>
      ) : (
        visibleItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            orderingOpen={orderingOpen}
            onCustomize={onCustomize}
          />
        ))
      )}
    </div>
  );
}
