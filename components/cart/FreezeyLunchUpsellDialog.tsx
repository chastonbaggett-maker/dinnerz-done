"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Snowflake } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { useCart } from "@/components/cart/CartProvider";
import { MenuItemImage } from "@/components/menu/MenuItemImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  countFrozenLines,
  FREEZEY_BULK_MIN_QUANTITY,
  FREEZEY_BULK_DISCOUNT_PERCENT,
  isFreezeyBulkDiscountActive,
} from "@/lib/orders/pricing";

export const FREEZEY_UPSELL_SHOWN_KEY = "dinnerz-freezey-upsell-shown";

interface FreezeyLunchUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MenuItem[];
  loading?: boolean;
}

export function FreezeyLunchUpsellDialog({
  open,
  onOpenChange,
  items,
  loading = false,
}: FreezeyLunchUpsellDialogProps) {
  const { addLine, lines } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const badgeBaseClass = "border-transparent px-2.5 py-1 text-sm";

  const freezeyCount = countFrozenLines(lines);
  const freezeyBulkActive = isFreezeyBulkDiscountActive(lines);
  const freezeyRemaining = Math.max(0, FREEZEY_BULK_MIN_QUANTITY - freezeyCount);

  function getCartQuantity(menuItemId: string) {
    return lines
      .filter((line) => line.lineType === "frozen_addon" && line.menuItemId === menuItemId)
      .reduce((sum, line) => sum + line.quantity, 0);
  }

  useEffect(() => {
    if (open) setQuantities({});
  }, [open]);

  function getQuantity(itemId: string) {
    return quantities[itemId] ?? 1;
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, nextQuantity) }));
  }

  function dismiss() {
    sessionStorage.setItem(FREEZEY_UPSELL_SHOWN_KEY, "1");
    onOpenChange(false);
  }

  function handleAdd(item: MenuItem) {
    const quantity = getQuantity(item.id);
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
    updateQuantity(item.id, 1);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss();
        else onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-md">
        <DialogHeader className="gap-3">
          <div className="flex items-start gap-3 pr-10">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900">
              <Snowflake className="size-6" />
            </div>
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-xl font-semibold leading-tight">Add Freezey Lunches?</DialogTitle>
              <div className="flex flex-wrap gap-1.5">
                <Badge className={cn(badgeBaseClass, "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100")}>
                  Easy Lunches
                </Badge>
                <Badge className={cn(badgeBaseClass, "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100")}>
                  Heat and Stir
                </Badge>
                <Badge className={cn(badgeBaseClass, "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100")}>
                  Perfect for Work
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base">
            Freezer-ready meals ride along with your dinner delivery — {formatCents(799)} each. Buy{" "}
            {FREEZEY_BULK_MIN_QUANTITY} or more and save {FREEZEY_BULK_DISCOUNT_PERCENT}%.
          </DialogDescription>
          {freezeyCount > 0 && (
            <p
              className={cn(
                "text-sm font-medium",
                freezeyBulkActive ? "text-sky-700 dark:text-sky-300" : "text-muted-foreground"
              )}
            >
              {freezeyBulkActive
                ? `${FREEZEY_BULK_DISCOUNT_PERCENT}% off applied — ${freezeyCount} Freezey Lunches in cart.`
                : `${freezeyCount} in cart — add ${freezeyRemaining} more for ${FREEZEY_BULK_DISCOUNT_PERCENT}% off.`}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((key) => (
                <div key={key} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="size-14 shrink-0 animate-pulse rounded-lg bg-muted" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            items.map((item) => {
              const cartQuantity = getCartQuantity(item.id);

              return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3",
                  cartQuantity > 0 && "border-primary/20 bg-primary/[0.03]"
                )}
              >
                <MenuItemImage
                  itemId={item.id}
                  itemName={item.name}
                  imageUrl={item.image_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{item.name}</p>
                  <p className="text-sm font-semibold">{formatCents(item.base_price_cents)}</p>
                  {cartQuantity > 0 && (
                    <p className="mt-1 text-xs font-medium text-primary/70">
                      Currently in cart
                      {cartQuantity > 1 ? ` · ${cartQuantity}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center overflow-hidden rounded-lg border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-none"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums">
                      {getQuantity(item.id)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-none"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button className="h-12 shrink-0 rounded-lg px-4 text-sm" onClick={() => handleAdd(item)}>
                    Add
                  </Button>
                </div>
              </div>
            );
            })
          )}
        </div>

        <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:flex-col">
          <Button className="h-14 w-full text-base" onClick={dismiss}>
            Continue to checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
