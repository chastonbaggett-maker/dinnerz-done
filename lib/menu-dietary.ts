/** Menu library items available on the dairy-free menu. */
export const DAIRY_FREE_ITEM_IDS = new Set([
  "a1000000-0000-4000-8000-000000000001", // Herb Roasted Chicken
  "a1000000-0000-4000-8000-000000000002", // Beef Pot Roast
  "a1000000-0000-4000-8000-000000000004", // Salmon with Lemon Dill
  "a1000000-0000-4000-8000-000000000005", // BBQ Pulled Pork
  "a1000000-0000-4000-8000-000000000007", // Turkey Meatloaf
  "a1000000-0000-4000-8000-000000000010", // Stuffed Bell Peppers
  "a1000000-0000-4000-8000-000000000011", // Fish Tacos
]);

export type MenuVariant = "standard" | "dairy-free";

export function itemIsDairyFree(menuItemId: string) {
  return DAIRY_FREE_ITEM_IDS.has(menuItemId);
}

export function filterItemsByMenuVariant<T extends { menu_item?: { id: string } | null }>(
  items: T[],
  variant: MenuVariant
): T[] {
  if (variant === "standard") return items;
  return items.filter((item) => item.menu_item && itemIsDairyFree(item.menu_item.id));
}
