"use client";

import { useState } from "react";
import { Minus, Plus, Snowflake } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItemImage } from "@/components/menu/MenuItemImage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  countFrozenLines,
  FREEZEY_BULK_MIN_QUANTITY,
  FREEZEY_BULK_DISCOUNT_PERCENT,
  isFreezeyBulkDiscountActive,
} from "@/lib/orders/pricing";

interface FreezeyLunchesSectionProps {
  items: MenuItem[];
  orderingOpen: boolean;
  showHeader?: boolean;
}

export function FreezeyLunchesSection({ items, orderingOpen, showHeader = true }: FreezeyLunchesSectionProps) {
  const { addLine, lines } = useCart();
  const [selectingItemId, setSelectingItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const freezeyCount = countFrozenLines(lines);
  const freezeyBulkActive = isFreezeyBulkDiscountActive(lines);
  const freezeyRemaining = Math.max(0, FREEZEY_BULK_MIN_QUANTITY - freezeyCount);

  if (items.length === 0) return null;

  function openSelector(itemId: string) {
    setSelectingItemId(itemId);
    setQuantity(1);
  }

  function closeSelector() {
    setSelectingItemId(null);
    setQuantity(1);
  }

  function handleConfirmAdd(item: MenuItem) {
    addLine({
      lineType: "frozen_addon",
      menuItemId: item.id,
      itemName: item.name,
      unitPriceCents: item.base_price_cents,
      quantity,
      customizations: [],
    });
    toast.success(
      quantity === 1
        ? `${item.name} added — Easy lunch for the freezer!`
        : `${quantity}x ${item.name} added — Easy lunches for the freezer!`
    );
    closeSelector();
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
            Add freezer-ready meals to your delivery — {formatCents(799)} each. Buy {FREEZEY_BULK_MIN_QUANTITY} or
            more and save {FREEZEY_BULK_DISCOUNT_PERCENT}%.
          </p>
          {freezeyCount > 0 && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                freezeyBulkActive ? "text-sky-700 dark:text-sky-300" : "text-muted-foreground"
              )}
            >
              {freezeyBulkActive
                ? `${FREEZEY_BULK_DISCOUNT_PERCENT}% off applied in your cart.`
                : `${freezeyCount} in cart — add ${freezeyRemaining} more for ${FREEZEY_BULK_DISCOUNT_PERCENT}% off.`}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isSelecting = selectingItemId === item.id;

          return (
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

              <div
                className={cn(
                  "relative shrink-0 overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
                  isSelecting ? "h-[7.75rem]" : "h-14"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col items-end gap-2 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
                    isSelecting ? "-translate-y-[4rem]" : "translate-y-0"
                  )}
                >
                  <div
                    className={cn(
                      "transition-opacity duration-500 ease-out motion-reduce:transition-none",
                      isSelecting ? "pointer-events-none opacity-0" : "opacity-100"
                    )}
                  >
                    <Button
                      className={cn(
                        "h-14 rounded-xl px-5 text-base",
                        !orderingOpen &&
                          "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
                      )}
                      disabled={!orderingOpen}
                      onClick={() => openSelector(item.id)}
                    >
                      <Plus className="mr-1 size-4" />
                      Add
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "flex h-14 items-center overflow-hidden rounded-xl border transition-opacity duration-500 ease-out motion-reduce:transition-none",
                      isSelecting ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                    )}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-14 rounded-none"
                      aria-label={`Decrease ${item.name} quantity`}
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 px-1 text-center text-base font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-14 rounded-none"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "flex gap-2 transition-opacity duration-500 ease-out motion-reduce:transition-none",
                      isSelecting ? "opacity-100 delay-150" : "pointer-events-none opacity-0"
                    )}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="h-14 rounded-xl px-4 text-base"
                      onClick={closeSelector}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-14 rounded-xl px-5 text-base"
                      onClick={() => handleConfirmAdd(item)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
