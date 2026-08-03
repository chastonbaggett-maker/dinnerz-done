"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyMenuItem, MenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DailyMenuBuilderProps {
  serviceDate: string;
  dailyMenuId: string;
  items: DailyMenuItem[];
  libraryItems: MenuItem[];
  status: string;
}

export function DailyMenuBuilder({
  serviceDate,
  dailyMenuId,
  items,
  libraryItems,
  status,
}: DailyMenuBuilderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const onMenu = new Set(items.map((i) => i.menu_item_id));

  async function apiCall(url: string, method: string, body?: object) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    router.refresh();
  }

  async function addItem(menuItemId: string) {
    setLoading(menuItemId);
    try {
      await apiCall("/api/admin/menus/items", "POST", { dailyMenuId, menuItemId });
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function toggleSoldOut(id: string, soldOut: boolean) {
    try {
      await apiCall("/api/admin/menus/items", "PATCH", { id, sold_out: soldOut });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function removeItem(id: string) {
    try {
      await apiCall(`/api/admin/menus/items?id=${id}`, "DELETE");
      toast.success("Removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function publish() {
    setLoading("publish");
    try {
      await apiCall("/api/admin/menus/publish", "POST", { serviceDate });
      toast.success("Menu published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Menu for {serviceDate}</h2>
          <Badge className="mt-1">{status}</Badge>
        </div>
        <Button onClick={publish} disabled={loading === "publish" || items.length === 0}>
          {status === "published" ? "Re-publish" : "Publish menu"}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">On this menu</h3>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No items yet. Add from your library below.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="font-medium">{item.menu_item?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCents(item.price_override_cents ?? item.menu_item?.base_price_cents ?? 0)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={item.sold_out} onCheckedChange={(v) => toggleSoldOut(item.id, v)} />
                  Sold out
                </label>
                <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Add from library</h3>
        {libraryItems
          .filter((i) => i.item_type === "meal")
          .filter((i) => !onMenu.has(i.id))
          .map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{formatCents(item.base_price_cents)}</p>
              </div>
              <Button onClick={() => addItem(item.id)} disabled={loading === item.id}>
                Add
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
