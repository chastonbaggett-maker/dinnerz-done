"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CustomizationSheet } from "@/components/menu/CustomizationSheet";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import { FreezeyLunchUpsellDialog, FREEZEY_UPSELL_SHOWN_KEY } from "@/components/cart/FreezeyLunchUpsellDialog";
import { useCart } from "@/components/cart/CartProvider";
import type { BusinessSettings, DailyMenuItem, MenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { summarizeCustomizations } from "@/lib/orders/pricing";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const pathname = usePathname();
  const { lines, removeLine, itemCount, hydrated, subtotalCents } = useCart();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [editItem, setEditItem] = useState<DailyMenuItem | null>(null);
  const [editLineId, setEditLineId] = useState<string | undefined>();
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [frozenItems, setFrozenItems] = useState<MenuItem[]>([]);
  const [upsellLoading, setUpsellLoading] = useState(false);
  const upsellHandled = useRef(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!hydrated || itemCount === 0 || upsellHandled.current || pathname !== "/cart") return;

    if (sessionStorage.getItem(FREEZEY_UPSELL_SHOWN_KEY)) {
      upsellHandled.current = true;
      return;
    }

    let cancelled = false;

    async function prepareUpsell() {
      try {
        const settingsRes = await fetch("/api/settings");
        if (cancelled) return;

        if (!settingsRes.ok) {
          upsellHandled.current = true;
          return;
        }

        const nextSettings = (await settingsRes.json()) as BusinessSettings;
        if (!nextSettings.frozen_lunch_enabled) {
          upsellHandled.current = true;
          return;
        }

        setUpsellLoading(true);
        setUpsellOpen(true);
        sessionStorage.setItem(FREEZEY_UPSELL_SHOWN_KEY, "1");

        const itemsRes = await fetch("/api/frozen-addons");
        if (cancelled) return;

        if (!itemsRes.ok) {
          setUpsellOpen(false);
          setUpsellLoading(false);
          upsellHandled.current = true;
          return;
        }

        const items = (await itemsRes.json()) as MenuItem[];
        if (items.length === 0) {
          setUpsellOpen(false);
          setUpsellLoading(false);
          upsellHandled.current = true;
          return;
        }

        setFrozenItems(items);
        setUpsellLoading(false);
        upsellHandled.current = true;
      } catch {
        if (!cancelled) {
          upsellHandled.current = true;
          setUpsellOpen(false);
          setUpsellLoading(false);
        }
      }
    }

    void prepareUpsell();

    return () => {
      cancelled = true;
    };
  }, [hydrated, itemCount, pathname]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
        Loading cart...
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/" className={cn(buttonVariants(), "mt-6")}>
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-36">
      <h1 className="mb-6 text-2xl font-semibold">Your cart</h1>

      <div className="mb-6 space-y-3">
        {lines.map((line) => (
          <div key={line.id} className="rounded-xl border p-4">
            <div className="flex justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {line.quantity}x {line.itemName}
                  </p>
                  {line.lineType === "frozen_addon" ? (
                    <Badge
                      className={cn(
                        "border-transparent px-2.5 py-1 text-sm",
                        "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100"
                      )}
                    >
                      Freezey Lunch
                    </Badge>
                  ) : (
                    <Badge
                      className={cn(
                        "border-transparent px-2.5 py-1 text-sm",
                        "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                      )}
                    >
                      Fresh Dinner
                    </Badge>
                  )}
                </div>
                {line.customizations.length > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {summarizeCustomizations(line.customizations)}
                  </p>
                )}
              </div>
              <p className="font-medium">{formatCents(line.unitPriceCents * line.quantity)}</p>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => removeLine(line.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>

      {settings && (
        <div className="space-y-6">
          <CartOrderSummary settings={settings} />

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="font-medium">Delivery to your door</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fixed {formatCents(settings.driver_delivery_fee_cents)} delivery fee on every order. Tips are
              welcome and go directly to your driver.
            </p>
          </div>

          <Link
            href="/cart/checkout"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 w-full text-base",
              subtotalCents < settings.min_order_cents && "pointer-events-none opacity-50"
            )}
            aria-disabled={subtotalCents < settings.min_order_cents}
          >
            Continue
          </Link>
        </div>
      )}

      <CustomizationSheet
        item={editItem}
        open={Boolean(editItem)}
        onOpenChange={(open) => !open && setEditItem(null)}
        editLineId={editLineId}
      />

      <FreezeyLunchUpsellDialog
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        items={frozenItems}
        loading={upsellLoading}
      />
    </div>
  );
}
