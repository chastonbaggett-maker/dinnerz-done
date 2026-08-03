"use client";

import { Snowflake, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItemImage } from "@/components/menu/MenuItemImage";
import { toast } from "sonner";

interface FreezeyLunchesSectionProps {
  items: MenuItem[];
  orderingOpen: boolean;
  showHeader?: boolean;
}

export function FreezeyLunchesSection({ items, orderingOpen, showHeader = true }: FreezeyLunchesSectionProps) {
  const { addLine } = useCart();

  if (items.length === 0) return null;

  function handleAdd(item: MenuItem) {
    addLine({
      lineType: "frozen_addon",
      menuItemId: item.id,
      itemName: item.name,
      unitPriceCents: item.base_price_cents,
      quantity: 1,
      customizations: [],
    });
    toast.success(`${item.name} added — Easy lunch for the freezer!`);
  }

  return (
    <section className="space-y-4">
      {showHeader && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900 dark:bg-sky-950/30">
          <div className="flex items-center gap-2">
            <Snowflake className="size-5 text-sky-600" />
            <h2 className="text-lg font-semibold">Freezey Lunches</h2>
            <Badge variant="secondary" className="ml-auto">
              Easy Lunches
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add freezer-ready meals to your delivery — {formatCents(799)} each. Perfect for easy lunches all week.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <MenuItemImage
              itemId={item.id}
              itemName={item.name}
              imageUrl={item.image_url}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              {item.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              )}
              <p className="mt-1 font-semibold">{formatCents(item.base_price_cents)}</p>
            </div>
            <Button
              className="h-14 shrink-0 rounded-xl px-5 text-base"
              disabled={!orderingOpen}
              onClick={() => handleAdd(item)}
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
