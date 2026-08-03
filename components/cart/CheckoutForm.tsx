"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Show, SignInButton, useUser } from "@clerk/nextjs";
import { useCart } from "@/components/cart/CartProvider";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import { DeliverySlotPicker } from "@/components/cart/DeliverySlotPicker";
import { formatCents } from "@/lib/dates";
import {
  formatDeliveryAddress,
  isDeliveryAddressComplete,
  type DeliveryAddressFields,
} from "@/lib/orders/address";
import { calculateOrderTotal } from "@/lib/orders/pricing";
import {
  clearSavedCheckoutDetails,
  loadSavedCheckout,
  persistCheckoutDetails,
  setSaveDenied,
} from "@/lib/orders/saved-checkout";
import type { BusinessSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CheckoutFormProps {
  settings: BusinessSettings;
  denySaveDetails: boolean;
  onDenySaveDetailsChange: (denied: boolean) => void;
}

const emptyAddress: DeliveryAddressFields = {
  street: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

export function CheckoutForm({ settings, denySaveDetails, onDenySaveDetailsChange }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { lines, dailyMenuId, serviceDate, subtotalCents, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliverySlotId, setDeliverySlotId] = useState("");
  const [isPremiumDelivery, setIsPremiumDelivery] = useState(false);
  const [requestedTime, setRequestedTime] = useState("");
  const fulfillmentType = "delivery" as const;
  const [form, setForm] = useState({
    customerName: user?.fullName ?? "",
    phone: "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    notes: "",
  });
  const [address, setAddress] = useState<DeliveryAddressFields>(emptyAddress);

  useEffect(() => {
    const saved = loadSavedCheckout();
    if (!saved) return;

    setForm((prev) => ({
      ...prev,
      customerName: saved.customerName || prev.customerName,
      phone: saved.phone || prev.phone,
      email: saved.email || prev.email,
    }));
    setAddress(saved.address);
    onDenySaveDetailsChange(false);
  }, [onDenySaveDetailsChange]);

  useEffect(() => {
    if (denySaveDetails) {
      clearSavedCheckoutDetails();
      setSaveDenied(true);
      return;
    }
    setSaveDenied(false);
  }, [denySaveDetails]);

  const premiumFee = isPremiumDelivery ? settings.premium_delivery_fee_cents : 0;
  const total = calculateOrderTotal(
    subtotalCents,
    settings.driver_delivery_fee_cents,
    fulfillmentType,
    premiumFee
  );
  const belowMinimum = subtotalCents < settings.min_order_cents;

  function updateAddress(field: keyof DeliveryAddressFields, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dailyMenuId || lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (belowMinimum) {
      toast.error(`Minimum order is ${formatCents(settings.min_order_cents)}`);
      return;
    }
    if (!isDeliveryAddressComplete(address)) {
      toast.error("Please complete your delivery address");
      return;
    }

    if (isPremiumDelivery) {
      if (!requestedTime) {
        toast.error("Please choose your preferred arrival time");
        return;
      }
      if (!deliverySlotId) {
        toast.error("Please choose an arrival time within the delivery window");
        return;
      }
    } else if (!deliverySlotId) {
      toast.error("Please select a delivery time window");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyMenuId,
          customerName: form.customerName,
          phone: form.phone,
          email: form.email,
          fulfillmentType,
          deliveryAddress: formatDeliveryAddress(address),
          deliverySlotId,
          isPremiumDelivery,
          requestedDeliveryTime:
            isPremiumDelivery && serviceDate ? `${serviceDate}T${requestedTime}:00` : undefined,
          notes: form.notes || undefined,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      if (data.url) {
        if (denySaveDetails) {
          setSaveDenied(true);
          clearSavedCheckoutDetails();
        } else {
          persistCheckoutDetails({
            customerName: form.customerName,
            phone: form.phone,
            email: form.email,
            address,
          });
        }
        clearCart();
        window.location.href = data.url;
        return;
      }

      if (data.orderId) {
        if (denySaveDetails) {
          setSaveDenied(true);
          clearSavedCheckoutDetails();
        } else {
          persistCheckoutDetails({
            customerName: form.customerName,
            phone: form.phone,
            email: form.email,
            address,
          });
        }
        clearCart();
        router.push(`/order/${data.orderId}?demo=1`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CartOrderSummary settings={settings} premiumFeeCents={premiumFee} />

      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="font-medium">Delivery to your door</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fixed {formatCents(settings.driver_delivery_fee_cents)} delivery fee on every order. Tips are
          welcome and go directly to your driver.
        </p>
      </div>

      <DeliverySlotPicker
        serviceDate={serviceDate}
        premiumFeeCents={settings.premium_delivery_fee_cents}
        selectedSlotId={deliverySlotId}
        isPremium={isPremiumDelivery}
        requestedTime={requestedTime}
        onSlotChange={(slotId) => {
          setDeliverySlotId(slotId);
          if (slotId) {
            setIsPremiumDelivery(false);
            setRequestedTime("");
          }
        }}
        onPremiumChange={(premium) => {
          setIsPremiumDelivery(premium);
          if (premium) {
            setDeliverySlotId("");
            setRequestedTime("");
          }
        }}
        onRequestedTimeChange={(time, slotId) => {
          setRequestedTime(time);
          if (slotId) setDeliverySlotId(slotId);
        }}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Contact information</h2>
          <p className="text-sm text-muted-foreground">We&apos;ll use this to confirm your order.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            className="h-12"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            type="tel"
            className="h-12"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            required
            type="email"
            className="h-12"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Delivery address</h2>
          <p className="text-sm text-muted-foreground">Where should we bring your order?</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street address</Label>
          <Input
            id="street"
            required
            autoComplete="address-line1"
            className="h-12"
            value={address.street}
            onChange={(e) => updateAddress("street", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="line2">Apt, suite, or unit (optional)</Label>
          <Input
            id="line2"
            autoComplete="address-line2"
            className="h-12"
            value={address.line2}
            onChange={(e) => updateAddress("line2", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            required
            autoComplete="address-level2"
            className="h-12"
            value={address.city}
            onChange={(e) => updateAddress("city", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              required
              autoComplete="address-level1"
              className="h-12 uppercase"
              maxLength={2}
              value={address.state}
              onChange={(e) => updateAddress("state", e.target.value.replace(/[^a-zA-Z]/g, ""))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP code</Label>
            <Input
              id="zip"
              required
              autoComplete="postal-code"
              inputMode="numeric"
              className="h-12"
              maxLength={10}
              value={address.zip}
              onChange={(e) => updateAddress("zip", e.target.value.replace(/[^\d-]/g, ""))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <Show when="signed-out">
        <p className="text-sm text-muted-foreground">
          <SignInButton mode="modal">
            <button type="button" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </button>
          </SignInButton>{" "}
          to save your info and view order history.
        </p>
      </Show>
      <Show when="signed-in">
        <p className="text-sm text-muted-foreground">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
      </Show>

      <Button type="submit" className="h-14 w-full text-base" disabled={loading || belowMinimum || lines.length === 0}>
        {loading ? "Processing..." : `Pay ${formatCents(total)}`}
      </Button>
    </form>
  );
}
