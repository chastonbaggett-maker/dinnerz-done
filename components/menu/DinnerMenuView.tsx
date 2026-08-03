"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailyMenu, DailyMenuItem } from "@/lib/types";
import { type MenuVariant } from "@/lib/menu-dietary";
import { canPlaceOrderToday, getPreferredMenuDate } from "@/lib/orders/cutoff";
import { useCart } from "@/components/cart/CartProvider";
import { MenuVariantTabs } from "@/components/menu/MenuVariantTabs";
import { MenuDatePicker } from "@/components/menu/MenuDatePicker";
import { MenuDayContent } from "@/components/menu/MenuDayContent";
import { CutoffBanner } from "@/components/menu/CutoffBanner";
import { CustomizationSheet } from "@/components/menu/CustomizationSheet";
import { CartBar } from "@/components/cart/CartBar";
import { PageIcon } from "@/components/layout/PageIcon";

export interface MenuWithItems {
  menu: DailyMenu;
  items: DailyMenuItem[];
}

interface DinnerMenuViewProps {
  menusWithItems: MenuWithItems[];
  timezone: string;
  businessName: string;
  initialExpandedDate?: string;
}

function getDefaultSelectedDate(
  menusWithItems: MenuWithItems[],
  timezone: string,
  initialDate?: string
) {
  const menus = menusWithItems.map(({ menu }) => menu);

  if (initialDate && menus.some((menu) => menu.service_date === initialDate)) {
    return initialDate;
  }

  return getPreferredMenuDate(menus, timezone);
}

export function DinnerMenuView({
  menusWithItems,
  timezone,
  businessName,
  initialExpandedDate,
}: DinnerMenuViewProps) {
  const { setMenuContext } = useCart();
  const [selectedItem, setSelectedItem] = useState<DailyMenuItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuVariant, setMenuVariant] = useState<MenuVariant>("standard");
  const [selectedDate, setSelectedDate] = useState(() =>
    getDefaultSelectedDate(menusWithItems, timezone, initialExpandedDate)
  );

  const menus = useMemo(() => menusWithItems.map(({ menu }) => menu), [menusWithItems]);

  const selectedEntry = useMemo(
    () => menusWithItems.find(({ menu }) => menu.service_date === selectedDate) ?? menusWithItems[0],
    [menusWithItems, selectedDate]
  );

  const orderableEntry = useMemo(
    () => menusWithItems.find(({ menu }) => canPlaceOrderToday(menu, timezone)),
    [menusWithItems, timezone]
  );

  useEffect(() => {
    setMenuVariant("standard");
  }, [selectedDate]);

  useEffect(() => {
    const cartMenu = orderableEntry ?? selectedEntry;
    if (cartMenu) {
      setMenuContext(cartMenu.menu.id, cartMenu.menu.service_date);
    }
  }, [orderableEntry, selectedEntry, setMenuContext]);

  return (
    <>
      <div className="mx-auto w-full max-w-lg space-y-6 px-4 pb-36 pt-6">
        <div className="flex items-start gap-3">
          <PageIcon variant="menu" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
            <p className="text-sm text-muted-foreground">
              {businessName} · Dinners at your door
            </p>
          </div>
        </div>

        {selectedEntry && (
          <section className="space-y-4">
            <CutoffBanner menu={selectedEntry.menu} timezone={timezone} />

            <MenuDatePicker
              menus={menus}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              timezone={timezone}
            />

            <MenuVariantTabs value={menuVariant} onValueChange={setMenuVariant} />

            <MenuDayContent
              items={selectedEntry.items}
              menuVariant={menuVariant}
              orderingOpen={canPlaceOrderToday(selectedEntry.menu, timezone)}
              onCustomize={(item) => {
                setSelectedItem(item);
                setSheetOpen(true);
              }}
            />
          </section>
        )}
      </div>

      <CustomizationSheet item={selectedItem} open={sheetOpen} onOpenChange={setSheetOpen} />
      <CartBar />
    </>
  );
}
