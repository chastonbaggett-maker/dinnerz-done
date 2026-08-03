const NAV_SHELF_USE_COUNT_KEY = "dinnerz-nav-shelf-use-count";
const LEGACY_NAV_SHELF_USED_KEY = "dinnerz-nav-shelf-used";

export const NAV_SHELF_PULSE_MAX_USES = 3;

/** Shelf peek on app open — one continuous pull-up / snap-down motion (see globals.css). */
export const NAV_SHELF_APP_OPEN_PEEK = {
  delayAfterAppLoadMs: 160,
  durationMs: 1280,
} as const;

export const APP_LOAD_COMPLETE_EVENT = "dd:app-load-complete";

function getNavShelfUseCount() {
  if (typeof window === "undefined") return NAV_SHELF_PULSE_MAX_USES;

  const countRaw = localStorage.getItem(NAV_SHELF_USE_COUNT_KEY);
  if (countRaw !== null) {
    const parsed = Number.parseInt(countRaw, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (localStorage.getItem(LEGACY_NAV_SHELF_USED_KEY) === "1") {
    return 1;
  }

  return 0;
}

/** Signed-in users stop seeing hints after a few manual opens; guests always see them. */
function navShelfHintsEnabled(isSignedIn: boolean) {
  if (!isSignedIn) return true;
  return getNavShelfUseCount() < NAV_SHELF_PULSE_MAX_USES;
}

export function shouldPlayNavShelfAppOpenPeek(isSignedIn: boolean) {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return navShelfHintsEnabled(isSignedIn);
}

export function shouldShowNavShelfPulse(isSignedIn: boolean) {
  return navShelfHintsEnabled(isSignedIn);
}

export function recordNavShelfUse(isSignedIn: boolean) {
  if (typeof window === "undefined" || !isSignedIn) return;

  const next = Math.min(getNavShelfUseCount() + 1, NAV_SHELF_PULSE_MAX_USES);
  localStorage.setItem(NAV_SHELF_USE_COUNT_KEY, String(next));
  localStorage.removeItem(LEGACY_NAV_SHELF_USED_KEY);
}
