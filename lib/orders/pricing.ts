import type { CartLine } from "@/lib/types";

export const FREEZEY_BULK_MIN_QUANTITY = 3;
export const FREEZEY_BULK_DISCOUNT_PERCENT = 30;
export const FREEZEY_BULK_DISCOUNT_RATE = FREEZEY_BULK_DISCOUNT_PERCENT / 100;

function calculateUndiscountedLineTotal(line: CartLine) {
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

export interface LineTotalOptions {
  cartLines?: CartLine[];
  applyFreezeyBulkDiscount?: boolean;
}

export function isFreezeyBulkDiscountActive(lines: CartLine[]) {
  return countFrozenLines(lines) >= FREEZEY_BULK_MIN_QUANTITY;
}

export function calculateLineTotal(line: CartLine, options?: LineTotalOptions) {
  const total = calculateUndiscountedLineTotal(line);

  let applyDiscount = options?.applyFreezeyBulkDiscount;
  if (applyDiscount === undefined && options?.cartLines) {
    applyDiscount = line.lineType === "frozen_addon" && isFreezeyBulkDiscountActive(options.cartLines);
  }

  if (applyDiscount && line.lineType === "frozen_addon") {
    return Math.round(total * (1 - FREEZEY_BULK_DISCOUNT_RATE));
  }

  return total;
}

export function calculateFreezeyBulkSavingsCents(lines: CartLine[]) {
  if (!isFreezeyBulkDiscountActive(lines)) return 0;

  const frozenLines = lines.filter((line) => line.lineType === "frozen_addon");
  const before = frozenLines.reduce((sum, line) => sum + calculateUndiscountedLineTotal(line), 0);
  const after = frozenLines.reduce(
    (sum, line) => sum + calculateLineTotal(line, { applyFreezeyBulkDiscount: true }),
    0
  );

  return before - after;
}

export function calculateCartSubtotal(lines: CartLine[]) {
  const bulkActive = isFreezeyBulkDiscountActive(lines);
  return lines.reduce(
    (sum, line) => sum + calculateLineTotal(line, { applyFreezeyBulkDiscount: bulkActive }),
    0
  );
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
