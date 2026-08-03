/** Menu library items that include a side salad with the meal. */
export const COMES_WITH_SALAD_ITEM_IDS = new Set([
  "a1000000-0000-4000-8000-000000000003", // Vegetable Lasagna
  "a1000000-0000-4000-8000-000000000006", // Mediterranean Quinoa Bowl
  "a1000000-0000-4000-8000-000000000010", // Stuffed Bell Peppers
]);

export function itemComesWithSalad(menuItemId: string) {
  return COMES_WITH_SALAD_ITEM_IDS.has(menuItemId);
}

/** Menu library items that include bread with the meal. */
export const COMES_WITH_BREAD_ITEM_IDS = new Set([
  "a1000000-0000-4000-8000-000000000003", // Vegetable Lasagna
  "a1000000-0000-4000-8000-000000000002", // Beef Pot Roast
  "a1000000-0000-4000-8000-000000000007", // Turkey Meatloaf
  "a1000000-0000-4000-8000-000000000012", // Shepherd's Pie
]);

export function itemComesWithBread(menuItemId: string) {
  return COMES_WITH_BREAD_ITEM_IDS.has(menuItemId);
}
