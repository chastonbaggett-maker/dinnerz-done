"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartCustomization, DailyCustomizationGroup, DailyMenuItem } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { calculateLineTotal } from "@/lib/orders/pricing";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface CustomizationSheetProps {
  item: DailyMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLineId?: string;
  initialCustomizations?: CartCustomization[];
  initialQuantity?: number;
}

function buildInitialSelections(groups: DailyCustomizationGroup[]) {
  const map: Record<string, CartCustomization> = {};
  for (const group of groups) {
    map[group.id] = {
      groupId: group.id,
      groupName: group.name,
      type: group.type,
      selections: [],
    };
  }
  return map;
}

export function CustomizationSheet({
  item,
  open,
  onOpenChange,
  editLineId,
  initialCustomizations,
  initialQuantity = 1,
}: CustomizationSheetProps) {
  const { addLine, updateLine } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selections, setSelections] = useState<Record<string, CartCustomization>>({});

  useEffect(() => {
    if (!item) return;
    const base = buildInitialSelections(item.customization_groups ?? []);
    if (initialCustomizations) {
      for (const c of initialCustomizations) {
        base[c.groupId] = c;
      }
    }
    setSelections(base);
    setQuantity(initialQuantity);
  }, [item, initialCustomizations, initialQuantity]);

  const unitPrice = item ? (item.price_override_cents ?? item.menu_item!.base_price_cents) : 0;

  const previewLine = useMemo(() => {
    if (!item) return null;
    return {
      id: "preview",
      lineType: "meal" as const,
      dailyMenuItemId: item.id,
      itemName: item.menu_item!.name,
      unitPriceCents: unitPrice,
      quantity,
      customizations: Object.values(selections),
    };
  }, [item, unitPrice, quantity, selections]);

  const lineTotal = previewLine ? calculateLineTotal(previewLine) : 0;

  function validateSelections() {
    if (!item?.customization_groups) return true;

    for (const group of item.customization_groups) {
      const sel = selections[group.id];
      const count =
        group.type === "text"
          ? sel?.selections[0]?.textValue?.trim()
            ? 1
            : 0
          : group.type === "quantity"
            ? sel?.selections.reduce((s, x) => s + (x.quantity ?? 0), 0) ?? 0
            : sel?.selections.length ?? 0;

      if (group.required && count < Math.max(group.min_selections, 1)) {
        toast.error(`Please choose ${group.name}`);
        return false;
      }
      if (count < group.min_selections) {
        toast.error(`Select at least ${group.min_selections} for ${group.name}`);
        return false;
      }
      if (count > group.max_selections) {
        toast.error(`Select at most ${group.max_selections} for ${group.name}`);
        return false;
      }
    }
    return true;
  }

  function handleAdd() {
    if (!item || !previewLine) return;
    if (!validateSelections()) return;

    const payload = {
      lineType: "meal" as const,
      dailyMenuItemId: previewLine.dailyMenuItemId,
      itemName: previewLine.itemName,
      unitPriceCents: previewLine.unitPriceCents,
      quantity: previewLine.quantity,
      customizations: previewLine.customizations.filter((c) => c.selections.length > 0),
    };

    if (editLineId) {
      updateLine(editLineId, payload);
      toast.success("Item updated");
    } else {
      addLine(payload);
      toast.success("Added to cart");
    }
    onOpenChange(false);
  }

  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle className="text-left text-xl">{item.menu_item!.name}</SheetTitle>
          <SheetDescription className="text-left">{item.menu_item!.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {(item.customization_groups ?? []).map((group) => (
            <div key={group.id} className="space-y-3">
              <div>
                <Label className="text-base">
                  {group.name}
                  {group.required && <span className="text-destructive"> *</span>}
                </Label>
                {group.type === "multi_choice" && (
                  <p className="text-xs text-muted-foreground">
                    Choose up to {group.max_selections}
                  </p>
                )}
              </div>

              {group.type === "single_choice" && (
                <RadioGroup
                  value={selections[group.id]?.selections[0]?.optionId ?? ""}
                  onValueChange={(optionId) => {
                    const option = group.options?.find((o) => o.id === optionId);
                    if (!option) return;
                    setSelections((prev) => ({
                      ...prev,
                      [group.id]: {
                        groupId: group.id,
                        groupName: group.name,
                        type: group.type,
                        selections: [
                          {
                            optionId: option.id,
                            optionName: option.name,
                            priceModifierCents: option.price_modifier_cents,
                          },
                        ],
                      },
                    }));
                  }}
                >
                  {(group.options ?? []).map((option) => (
                    <label
                      key={option.id}
                      className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option.id} />
                        <span>{option.name}</span>
                      </div>
                      {option.price_modifier_cents > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +{formatCents(option.price_modifier_cents)}
                        </span>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              )}

              {group.type === "multi_choice" && (
                <div className="space-y-2">
                  {(group.options ?? []).map((option) => {
                    const selected = selections[group.id]?.selections.some((s) => s.optionId === option.id);
                    return (
                      <label
                        key={option.id}
                        className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              setSelections((prev) => {
                                const current = prev[group.id]?.selections ?? [];
                                let next = current;
                                if (checked) {
                                  if (current.length >= group.max_selections) {
                                    toast.error(`Maximum ${group.max_selections} selections`);
                                    return prev;
                                  }
                                  next = [
                                    ...current,
                                    {
                                      optionId: option.id,
                                      optionName: option.name,
                                      priceModifierCents: option.price_modifier_cents,
                                    },
                                  ];
                                } else {
                                  next = current.filter((s) => s.optionId !== option.id);
                                }
                                return {
                                  ...prev,
                                  [group.id]: {
                                    groupId: group.id,
                                    groupName: group.name,
                                    type: group.type,
                                    selections: next,
                                  },
                                };
                              });
                            }}
                          />
                          <span>{option.name}</span>
                        </div>
                        {option.price_modifier_cents > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatCents(option.price_modifier_cents)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {group.type === "quantity" && (group.options ?? []).map((option) => {
                const currentQty =
                  selections[group.id]?.selections.find((s) => s.optionId === option.id)?.quantity ?? 0;
                return (
                  <div key={option.id} className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p>{option.name}</p>
                      {option.price_modifier_cents > 0 && (
                        <p className="text-sm text-muted-foreground">+{formatCents(option.price_modifier_cents)} each</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10"
                        onClick={() => {
                          const nextQty = Math.max(0, currentQty - 1);
                          setSelections((prev) => ({
                            ...prev,
                            [group.id]: {
                              groupId: group.id,
                              groupName: group.name,
                              type: group.type,
                              selections:
                                nextQty === 0
                                  ? (prev[group.id]?.selections.filter((s) => s.optionId !== option.id) ?? [])
                                  : [
                                      ...(prev[group.id]?.selections.filter((s) => s.optionId !== option.id) ?? []),
                                      {
                                        optionId: option.id,
                                        optionName: option.name,
                                        priceModifierCents: option.price_modifier_cents,
                                        quantity: nextQty,
                                      },
                                    ],
                            },
                          }));
                        }}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center">{currentQty}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10"
                        disabled={currentQty >= group.max_selections}
                        onClick={() => {
                          const nextQty = currentQty + 1;
                          if (nextQty > group.max_selections) return;
                          setSelections((prev) => ({
                            ...prev,
                            [group.id]: {
                              groupId: group.id,
                              groupName: group.name,
                              type: group.type,
                              selections: [
                                ...(prev[group.id]?.selections.filter((s) => s.optionId !== option.id) ?? []),
                                {
                                  optionId: option.id,
                                  optionName: option.name,
                                  priceModifierCents: option.price_modifier_cents,
                                  quantity: nextQty,
                                },
                              ],
                            },
                          }));
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}

              {group.type === "text" && (
                <Textarea
                  placeholder="Add special instructions..."
                  value={selections[group.id]?.selections[0]?.textValue ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelections((prev) => ({
                      ...prev,
                      [group.id]: {
                        groupId: group.id,
                        groupName: group.name,
                        type: group.type,
                        selections: value
                          ? [{ optionName: group.name, priceModifierCents: 0, textValue: value }]
                          : [],
                      },
                    }));
                  }}
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
            <Label>Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </Button>
              <Input
                className="h-10 w-14 text-center"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button className="h-14 w-full text-base" onClick={handleAdd}>
            {editLineId ? "Update item" : "Add to cart"} · {formatCents(lineTotal)}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
