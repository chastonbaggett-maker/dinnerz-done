"use client";

import type { MenuVariant } from "@/lib/menu-dietary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MenuVariantTabsProps {
  value: MenuVariant;
  onValueChange: (value: MenuVariant) => void;
}

export function MenuVariantTabs({ value, onValueChange }: MenuVariantTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as MenuVariant)}
      className="w-full"
    >
      <TabsList className="grid !h-auto min-h-14 w-full grid-cols-2 gap-1 rounded-2xl p-1.5">
        <TabsTrigger
          value="standard"
          className="min-h-12 rounded-xl px-3 py-3 text-base font-semibold touch-manipulation"
        >
          Standard Menu
        </TabsTrigger>
        <TabsTrigger
          value="dairy-free"
          className="min-h-12 rounded-xl px-3 py-3 text-base font-semibold touch-manipulation"
        >
          Dairy Free Menu
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
