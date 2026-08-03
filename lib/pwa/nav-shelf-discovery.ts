const NAV_SHELF_USED_KEY = "dinnerz-nav-shelf-used";

export function hasUsedNavShelf() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(NAV_SHELF_USED_KEY) === "1";
}

export function markNavShelfUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAV_SHELF_USED_KEY, "1");
}
