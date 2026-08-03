"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { useCart } from "@/components/cart/CartProvider";
import type { BusinessSettings } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { isSaveDenied } from "@/lib/orders/saved-checkout";

export default function CartCheckoutPage() {
  const { itemCount, hydrated } = useCart();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [denySaveDetails, setDenySaveDetails] = useState(false);

  useEffect(() => {
    setDenySaveDetails(isSaveDenied());
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => null);
  }, []);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
        Loading checkout...
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
      <Link
        href="/cart"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to cart
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Delivery &amp; payment</h1>
        <Badge
          className="mt-3 h-auto min-h-9 max-w-full rounded-lg border-transparent bg-emerald-600 px-3 py-2 text-sm leading-snug font-normal whitespace-normal text-white [a]:hover:bg-emerald-600/90"
        >
          Don&apos;t worry, we&apos;ll save these details for your next order to keep things easy :) Information is
          secure, we promise!
        </Badge>
        <label className="mt-2 flex cursor-pointer items-start gap-2.5">
          <Checkbox
            checked={denySaveDetails}
            onCheckedChange={(checked) => setDenySaveDetails(checked === true)}
            className="mt-0.5 size-3.5 rounded-[3px] opacity-70"
          />
          <span className="text-xs leading-snug text-muted-foreground">
            Don&apos;t save my information for future orders
          </span>
        </label>
      </div>
      {settings && (
        <CheckoutForm settings={settings} denySaveDetails={denySaveDetails} onDenySaveDetailsChange={setDenySaveDetails} />
      )}
    </div>
  );
}
