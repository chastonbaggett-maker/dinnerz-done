"use client";

import { useEffect, useState } from "react";
import type { DailyMenu, DailyMenuItem } from "@/lib/types";
import { filterItemsByMenuVariant, type MenuVariant } from "@/lib/menu-dietary";
import { canPlaceOrderToday } from "@/lib/orders/cutoff";
import { useCart } from "@/components/cart/CartProvider";
import { CutoffBanner } from "@/components/menu/CutoffBanner";
import { MenuDatePicker } from "@/components/menu/MenuDatePicker";
import { MenuVariantTabs } from "@/components/menu/MenuVariantTabs";
import { MenuCard } from "@/components/menu/MenuCard";
import { CustomizationSheet } from "@/components/menu/CustomizationSheet";
import { CartBar } from "@/components/cart/CartBar";
import { PageIcon } from "@/components/layout/PageIcon";

interface DinnerMenuViewProps {
  menu: DailyMenu;
  items: DailyMenuItem[];
  upcomingMenus: DailyMenu[];
  timezone: string;
  businessName: string;
}

export function DinnerMenuView({ menu, items, upcomingMenus, timezone, businessName }: DinnerMenuViewProps) {
  const { setMenuContext } = useCart();
  const [selectedItem, setSelectedItem] = useState<DailyMenuItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuVariant, setMenuVariant] = useState<MenuVariant>("standard");

  const orderingOpen = canPlaceOrderToday(menu, timezone);
  const visibleItems = filterItemsByMenuVariant(items, menuVariant);

  useEffect(() => {
    setMenuVariant("standard");
  }, [menu.service_date]);

  useEffect(() => {
    setMenuContext(menu.id, menu.service_date);
  }, [menu.id, menu.service_date, setMenuContext]);

  return (
    <>
      <div className="mx-auto w-full max-w-lg space-y-6 px-4 pb-36 pt-6">
        <div>
          <div className="flex items-center gap-3">
            <PageIcon variant="menu" />
            <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {businessName} · Dinners at your door
          </p>
        </div>

        <MenuDatePicker menus={upcomingMenus} currentDate={menu.service_date} timezone={timezone} />

        <CutoffBanner menu={menu} timezone={timezone} />

        <MenuVariantTabs value={menuVariant} onValueChange={setMenuVariant} />

        <div className="space-y-4">
          {visibleItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              {menuVariant === "dairy-free"
                ? "No dairy-free items on this menu today. Try the standard menu."
                : "No items on this menu yet. Check back soon."}
            </p>
          ) : (
            visibleItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                orderingOpen={orderingOpen}
                onCustomize={(i) => {
                  setSelectedItem(i);
                  setSheetOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      <CustomizationSheet item={selectedItem} open={sheetOpen} onOpenChange={setSheetOpen} />
      <CartBar />
    </>
  );
}
