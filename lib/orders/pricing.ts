import type { CartLine } from "@/lib/types";

export function calculateLineTotal(line: CartLine) {
  const customizationTotal = line.customizations.reduce((sum, group) => {
    return (
      sum +
      group.selections.reduce((gSum, sel) => {
        const qty = group.type === "quantity" ? (sel.quantity ?? 1) : 1;
        return gSum + sel.priceModifierCents * qty;
      }, 0)
    );
  }, 0);

  return (line.unitPriceCents + customizationTotal) * line.quantity;
}

export function calculateCartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
}

export function calculateMealSubtotal(lines: CartLine[]) {
  return lines
    .filter((l) => l.lineType === "meal")
    .reduce((sum, line) => sum + calculateLineTotal(line), 0);
}

export function calculateOrderTotal(
  subtotalCents: number,
  deliveryFeeCents: number,
  fulfillmentType: "delivery" | "pickup",
  premiumFeeCents = 0
) {
  const fee = fulfillmentType === "delivery" ? deliveryFeeCents : 0;
  const premium = fulfillmentType === "delivery" ? premiumFeeCents : 0;
  return subtotalCents + fee + premium;
}

export function summarizeCustomizations(customizations: CartLine["customizations"]) {
  return customizations
    .flatMap((group) =>
      group.selections.map((sel) => {
        if (group.type === "text") return `${group.groupName}: ${sel.textValue ?? sel.optionName}`;
        const qty = group.type === "quantity" && (sel.quantity ?? 1) > 1 ? ` x${sel.quantity}` : "";
        return `${sel.optionName}${qty}`;
      })
    )
    .join(", ");
}

export function generateCartLineId() {
  return crypto.randomUUID();
}

export function countFrozenLines(lines: CartLine[]) {
  return lines.filter((l) => l.lineType === "frozen_addon").reduce((s, l) => s + l.quantity, 0);
}

export function countMealLines(lines: CartLine[]) {
  return lines.filter((l) => l.lineType === "meal").reduce((s, l) => s + l.quantity, 0);
}
