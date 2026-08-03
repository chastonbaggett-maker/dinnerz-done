/** Default food photos (Unsplash) keyed by menu item id */
export const MENU_ITEM_IMAGES: Record<string, string> = {
  "a1000000-0000-4000-8000-000000000001":
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000002":
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000003":
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000004":
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000005":
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000006":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000007":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000008":
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000009":
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000010":
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000011":
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop&q=80",
  "a1000000-0000-4000-8000-000000000012":
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop&q=80",
  "f1000000-0000-4000-8000-000000000001":
    "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=400&fit=crop&q=80",
  "f1000000-0000-4000-8000-000000000002":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop&q=80",
  "f1000000-0000-4000-8000-000000000003":
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop&q=80",
};

/** Fallback when DB rows use random ids without image_url (e.g. migration seed). */
export const MENU_ITEM_IMAGES_BY_NAME: Record<string, string> = {
  "Freezey Chili Lunch": MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000001"],
  "Freezey Chicken Soup": MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000002"],
  "Freezey Pasta Bake": MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000003"],
};

export function getMenuItemImageUrl(
  itemId: string,
  imageUrl: string | null | undefined,
  itemName?: string
) {
  if (imageUrl) return imageUrl;
  if (MENU_ITEM_IMAGES[itemId]) return MENU_ITEM_IMAGES[itemId];
  if (itemName && MENU_ITEM_IMAGES_BY_NAME[itemName]) return MENU_ITEM_IMAGES_BY_NAME[itemName];
  return null;
}
