"use client";

import { Plus } from "lucide-react";
import type { DailyMenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItemImage } from "@/components/menu/MenuItemImage";
import { itemComesWithBread, itemComesWithSalad } from "@/lib/menu-meal-badges";
import { cn } from "@/lib/utils";

interface MenuCardProps {
  item: DailyMenuItem;
  orderingOpen: boolean;
  onCustomize: (item: DailyMenuItem) => void;
}

export function MenuCard({ item, orderingOpen, onCustomize }: MenuCardProps) {
  const menuItem = item.menu_item!;
  const price = item.price_override_cents ?? menuItem.base_price_cents;
  const hasSideChoice = item.customization_groups?.some((group) => group.name.toLowerCase() === "side");
  const comesWithSalad = itemComesWithSalad(menuItem.id);
  const comesWithBread = itemComesWithBread(menuItem.id);
  const showBadges = hasSideChoice || comesWithSalad || comesWithBread || item.sold_out;

  return (
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <MenuItemImage
            itemId={menuItem.id}
            itemName={menuItem.name}
            imageUrl={menuItem.image_url}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold leading-tight">{menuItem.name}</h3>
                {showBadges && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {hasSideChoice && (
                      <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
                        Choose your side
                      </Badge>
                    )}
                    {comesWithSalad && (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-50 text-emerald-700"
                      >
                        Comes with salad
                      </Badge>
                    )}
                    {comesWithBread && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 bg-amber-50 text-amber-800"
                      >
                        Comes with bread
                      </Badge>
                    )}
                    {item.sold_out && <Badge variant="secondary">Sold out</Badge>}
                  </div>
                )}
              </div>
              <p className="shrink-0 text-lg font-semibold">{formatCents(price)}</p>
            </div>
            {menuItem.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{menuItem.description}</p>
            )}
            <Button
              className={cn(
                "mt-3 h-14 w-full rounded-xl text-base",
                !orderingOpen &&
                  "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
              )}
              disabled={!orderingOpen || item.sold_out}
              onClick={() => onCustomize(item)}
            >
              <Plus className="mr-2 size-4" />
              {item.customization_groups && item.customization_groups.length > 0 ? "Customize" : "Add"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
