"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatCents } from "@/lib/dates";
import { calculateOrderTotal } from "@/lib/orders/pricing";
import type { BusinessSettings } from "@/lib/types";

interface CartOrderSummaryProps {
  settings: BusinessSettings;
  premiumFeeCents?: number;
}

export function CartOrderSummary({ settings, premiumFeeCents = 0 }: CartOrderSummaryProps) {
  const { subtotalCents } = useCart();
  const deliveryFee = settings.driver_delivery_fee_cents;
  const total = calculateOrderTotal(
    subtotalCents,
    settings.driver_delivery_fee_cents,
    "delivery",
    premiumFeeCents
  );
  const belowMinimum = subtotalCents < settings.min_order_cents;

  return (
    <div className="rounded-xl border p-4 text-sm">
      <div className="flex justify-between py-1">
        <span>Subtotal</span>
        <span>{formatCents(subtotalCents)}</span>
      </div>
      <div className="flex justify-between py-1">
        <span>Delivery fee</span>
        <span>{formatCents(deliveryFee)}</span>
      </div>
      {premiumFeeCents > 0 && (
        <div className="flex justify-between py-1">
          <span>Premium exact-time</span>
          <span>{formatCents(premiumFeeCents)}</span>
        </div>
      )}
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <span>Total</span>
        <span>{formatCents(total)}</span>
      </div>
      {belowMinimum && (
        <p className="mt-2 text-destructive">Minimum order: {formatCents(settings.min_order_cents)}</p>
      )}
    </div>
  );
}
