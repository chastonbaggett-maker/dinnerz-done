"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import type { DeliveryTimeSlot } from "@/lib/types";
import { formatTimeSlot, findSlotForTime, slotHasCapacity } from "@/lib/delivery/slots";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { PremiumTimePicker } from "@/components/cart/PremiumTimePicker";
import { formatCents } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getRemainingCount(slot: DeliveryTimeSlot, selectedSlotId: string) {
  const remaining = slot.max_orders - slot.order_count;
  return selectedSlotId === slot.id ? Math.max(0, remaining - 1) : remaining;
}

const SPOT_HOLD_SECONDS = 10 * 60;

function formatHoldCountdown(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SpotLockedBadge({ lockedAt }: { lockedAt: number }) {
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SPOT_HOLD_SECONDS);

  useEffect(() => {
    const timer = window.setTimeout(() => setLocked(true), 150);
    return () => window.clearTimeout(timer);
  }, [lockedAt]);

  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - lockedAt) / 1000);
      setSecondsLeft(Math.max(0, SPOT_HOLD_SECONDS - elapsed));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [lockedAt]);

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Badge
        className={cn(
          "gap-1.5 border-transparent bg-primary px-2.5 py-1 text-sm text-primary-foreground",
          "animate-in fade-in zoom-in-95 duration-300"
        )}
      >
        <span className="relative inline-flex size-3.5 shrink-0">
          <LockOpen
            aria-hidden
            className={cn(
              "absolute inset-0 size-3.5 transition-all duration-300 ease-out",
              locked ? "scale-75 opacity-0 -rotate-12" : "scale-100 opacity-100 rotate-0"
            )}
          />
          <Lock
            aria-hidden
            className={cn(
              "absolute inset-0 size-3.5 transition-all duration-300 ease-out",
              locked ? "scale-100 opacity-100 rotate-0" : "scale-75 opacity-0 rotate-12"
            )}
          />
        </span>
        You&apos;re locked in
      </Badge>
      <p className="text-[11px] tabular-nums text-muted-foreground">
        {secondsLeft > 0
          ? `Spot expires in ${formatHoldCountdown(secondsLeft)}`
          : "Spot hold expired"}
      </p>
    </div>
  );
}

interface DeliverySlotPickerProps {
  serviceDate: string | null;
  premiumFeeCents: number;
  selectedSlotId: string;
  isPremium: boolean;
  requestedTime: string;
  onSlotChange: (slotId: string) => void;
  onPremiumChange: (premium: boolean) => void;
  onRequestedTimeChange: (time: string, slotId: string | null) => void;
}

export function DeliverySlotPicker({
  serviceDate,
  premiumFeeCents,
  selectedSlotId,
  isPremium,
  requestedTime,
  onSlotChange,
  onPremiumChange,
  onRequestedTimeChange,
}: DeliverySlotPickerProps) {
  const [slots, setSlots] = useState<DeliveryTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedAt, setLockedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!serviceDate) return;
    setLoading(true);
    fetch(`/api/delivery-slots?date=${serviceDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data))
      .finally(() => setLoading(false));
  }, [serviceDate]);

  useEffect(() => {
    if (selectedSlotId && !isPremium) {
      setLockedAt(Date.now());
    } else {
      setLockedAt(null);
    }
  }, [selectedSlotId, isPremium]);

  function handlePremiumToggle(premium: boolean) {
    onPremiumChange(premium);
    if (premium) {
      onSlotChange("");
    }
  }

  function handleSlotSelect(slotId: string) {
    onSlotChange(slotId);
    if (slotId) {
      onPremiumChange(false);
    }
  }

  function handlePremiumTimeChange(time: string) {
    const slot = findSlotForTime(slots, time);
    onRequestedTimeChange(time, slot?.id ?? null);
  }

  const displaySelectedSlotId = isPremium ? "" : selectedSlotId;

  if (loading) return <p className="text-sm text-muted-foreground">Loading delivery windows...</p>;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Delivery window</Label>
        <p className="text-xs text-muted-foreground">Standard 2-hour time slots</p>
      </div>

      <RadioGroup
        value={displaySelectedSlotId}
        onValueChange={handleSlotSelect}
        className="grid gap-3"
      >
        {slots.map((slot) => {
          const isSelected = displaySelectedSlotId === slot.id;
          const available = slotHasCapacity(slot);
          const remaining = getRemainingCount(slot, displaySelectedSlotId);

          return (
            <label
              key={slot.id}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                isSelected && "border-primary bg-primary/5",
                !available && !isSelected && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={slot.id} disabled={!available && !isSelected} />
                <span className="text-base font-medium">{formatTimeSlot(slot)}</span>
              </div>
              <div className="flex items-center gap-3">
                {isSelected && lockedAt !== null && <SpotLockedBadge lockedAt={lockedAt} />}
                {!available && !isSelected ? (
                  <Badge variant="secondary" className="px-2.5 py-1 text-sm">
                    Full
                  </Badge>
                ) : (
                  <span className="text-sm tabular-nums text-muted-foreground">{remaining} left</span>
                )}
              </div>
            </label>
          );
        })}
      </RadioGroup>

      <div
        className={cn(
          "rounded-xl border p-4 transition-colors",
          isPremium && "border-emerald-600 bg-emerald-600/5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge className="h-auto border-transparent bg-emerald-600 px-2.5 py-1 text-sm font-semibold text-white">
              Priority Delivery
            </Badge>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                We&apos;ll arrive within 15 minutes of your chosen time (+{formatCents(premiumFeeCents)}).
              </span>{" "}
              Example: If you select 5:00, your order may show up between 4:45 and 5:15.
            </p>
          </div>
          <Switch
            checked={isPremium}
            onCheckedChange={handlePremiumToggle}
            className="shrink-0 data-checked:bg-emerald-600 focus-visible:ring-emerald-600/40"
          />
        </div>
        {isPremium && (
          <div className="mt-3">
            <Label htmlFor="requested-time">Preferred arrival time</Label>
            <PremiumTimePicker slots={slots} value={requestedTime} onChange={handlePremiumTimeChange} />
          </div>
        )}
      </div>
    </div>
  );
}
