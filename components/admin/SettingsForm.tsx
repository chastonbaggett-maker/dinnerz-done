"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsFormProps {
  settings: BusinessSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: settings.business_name,
    timezone: settings.timezone,
    default_cutoff_hour: String(settings.default_cutoff_hour),
    default_cutoff_minute: String(settings.default_cutoff_minute),
    driver_delivery_fee: (settings.driver_delivery_fee_cents / 100).toFixed(2),
    premium_delivery_fee: (settings.premium_delivery_fee_cents / 100).toFixed(2),
    min_order: (settings.min_order_cents / 100).toFixed(2),
    pickup_address: settings.pickup_address ?? "",
    delivery_enabled: settings.delivery_enabled,
    pickup_enabled: settings.pickup_enabled,
    frozen_lunch_enabled: settings.frozen_lunch_enabled,
    slot_duration_minutes: String(settings.slot_duration_minutes),
    default_slot_start_hour: String(settings.default_slot_start_hour),
    default_slot_end_hour: String(settings.default_slot_end_hour),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: form.business_name,
          timezone: form.timezone,
          default_cutoff_hour: parseInt(form.default_cutoff_hour, 10),
          default_cutoff_minute: parseInt(form.default_cutoff_minute, 10),
          driver_delivery_fee_cents: Math.round(parseFloat(form.driver_delivery_fee) * 100),
          delivery_fee_cents: Math.round(parseFloat(form.driver_delivery_fee) * 100),
          premium_delivery_fee_cents: Math.round(parseFloat(form.premium_delivery_fee) * 100),
          min_order_cents: Math.round(parseFloat(form.min_order) * 100),
          pickup_address: form.pickup_address || null,
          delivery_enabled: form.delivery_enabled,
          pickup_enabled: form.pickup_enabled,
          frozen_lunch_enabled: form.frozen_lunch_enabled,
          slot_duration_minutes: parseInt(form.slot_duration_minutes, 10),
          default_slot_start_hour: parseInt(form.default_slot_start_hour, 10),
          default_slot_end_hour: parseInt(form.default_slot_end_hour, 10),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Label>Business name</Label>
        <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Timezone</Label>
        <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cutoff hour (24h)</Label>
          <Input
            type="number"
            min="0"
            max="23"
            value={form.default_cutoff_hour}
            onChange={(e) => setForm({ ...form, default_cutoff_hour: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Cutoff minute</Label>
          <Input
            type="number"
            min="0"
            max="59"
            value={form.default_cutoff_minute}
            onChange={(e) => setForm({ ...form, default_cutoff_minute: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Driver delivery fee ($)</Label>
          <p className="text-xs text-muted-foreground">100% goes to driver fund</p>
          <Input value={form.driver_delivery_fee} onChange={(e) => setForm({ ...form, driver_delivery_fee: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Premium exact-time fee ($)</Label>
          <Input value={form.premium_delivery_fee} onChange={(e) => setForm({ ...form, premium_delivery_fee: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Minimum order ($)</Label>
        <Input value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Slot duration (min)</Label>
          <Input value={form.slot_duration_minutes} onChange={(e) => setForm({ ...form, slot_duration_minutes: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Slots start hour</Label>
          <Input value={form.default_slot_start_hour} onChange={(e) => setForm({ ...form, default_slot_start_hour: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Slots end hour</Label>
          <Input value={form.default_slot_end_hour} onChange={(e) => setForm({ ...form, default_slot_end_hour: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Pickup address</Label>
        <Input value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.delivery_enabled} onCheckedChange={(v) => setForm({ ...form, delivery_enabled: v })} />
        <Label>Delivery enabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.pickup_enabled} onCheckedChange={(v) => setForm({ ...form, pickup_enabled: v })} />
        <Label>Pickup enabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.frozen_lunch_enabled} onCheckedChange={(v) => setForm({ ...form, frozen_lunch_enabled: v })} />
        <Label>Freezey Lunches enabled</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
