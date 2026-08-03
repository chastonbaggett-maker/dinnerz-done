"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomizationGroup, MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MenuItemFormProps {
  item?: MenuItem & { customization_groups?: CustomizationGroup[] };
}

export function MenuItemForm({ item }: MenuItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    base_price: item ? (item.base_price_cents / 100).toFixed(2) : "",
    item_type: item?.item_type ?? "meal",
    active: item?.active ?? true,
  });
  const [groups, setGroups] = useState<
    Array<{
      name: string;
      type: string;
      required: boolean;
      min_selections: number;
      max_selections: number;
      options: Array<{ name: string; price_modifier: string }>;
    }>
  >(
    item?.customization_groups?.map((g) => ({
      name: g.name,
      type: g.type,
      required: g.required,
      min_selections: g.min_selections,
      max_selections: g.max_selections,
      options: (g.options ?? []).map((o) => ({
        name: o.name,
        price_modifier: (o.price_modifier_cents / 100).toFixed(2),
      })),
    })) ?? []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/items", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item?.id,
          name: form.name,
          description: form.description || null,
          base_price_cents: Math.round(parseFloat(form.base_price) * 100),
          item_type: form.item_type,
          active: form.active,
          groups: groups.map((g, gi) => ({
            name: g.name,
            type: g.type,
            required: g.required,
            min_selections: g.min_selections,
            max_selections: g.max_selections,
            sort_order: gi,
            options: g.options.map((o, oi) => ({
              name: o.name,
              price_modifier_cents: Math.round(parseFloat(o.price_modifier || "0") * 100),
              sort_order: oi,
            })),
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(item ? "Item updated" : "Item created");
      router.push("/admin/items");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Base price ($)</Label>
          <Input
            id="price"
            required
            type="number"
            min="0"
            step="0.01"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Item type</Label>
          <Select value={form.item_type} onValueChange={(v) => v && setForm({ ...form, item_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meal">Dinner meal</SelectItem>
              <SelectItem value="frozen_addon">Freezey Lunch (frozen add-on)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-8">
          <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
          <Label>Active</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Customizations</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setGroups([
                ...groups,
                {
                  name: "New group",
                  type: "single_choice",
                  required: false,
                  min_selections: 0,
                  max_selections: 1,
                  options: [{ name: "Option", price_modifier: "0" }],
                },
              ])
            }
          >
            Add group
          </Button>
        </div>

        {groups.map((group, gi) => (
          <div key={gi} className="space-y-3 rounded-xl border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Group name"
                value={group.name}
                onChange={(e) => {
                  const next = [...groups];
                  next[gi].name = e.target.value;
                  setGroups(next);
                }}
              />
              <Select
                value={group.type}
                onValueChange={(type) => {
                  if (!type) return;
                  const next = [...groups];
                  next[gi].type = type;
                  setGroups(next);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single choice</SelectItem>
                  <SelectItem value="multi_choice">Multi choice</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={group.required}
                onCheckedChange={(required) => {
                  const next = [...groups];
                  next[gi].required = required;
                  setGroups(next);
                }}
              />
              <Label>Required</Label>
            </div>
            {group.type !== "text" && (
              <div className="space-y-2">
                {group.options.map((opt, oi) => (
                  <div key={oi} className="flex gap-2">
                    <Input
                      placeholder="Option name"
                      value={opt.name}
                      onChange={(e) => {
                        const next = [...groups];
                        next[gi].options[oi].name = e.target.value;
                        setGroups(next);
                      }}
                    />
                    <Input
                      placeholder="+$"
                      className="w-24"
                      value={opt.price_modifier}
                      onChange={(e) => {
                        const next = [...groups];
                        next[gi].options[oi].price_modifier = e.target.value;
                        setGroups(next);
                      }}
                    />
                  </div>
                ))}
                {group.type !== "text" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = [...groups];
                      next[gi].options.push({ name: "Option", price_modifier: "0" });
                      setGroups(next);
                    }}
                  >
                    Add option
                  </Button>
                )}
              </div>
            )}
            <Button type="button" variant="destructive" size="sm" onClick={() => setGroups(groups.filter((_, i) => i !== gi))}>
              Remove group
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : item ? "Update item" : "Create item"}
      </Button>
    </form>
  );
}
