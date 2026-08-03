import type { AppLoadSpec } from "@/lib/motion/types";

export const APP_LOAD_PREHIDE_STYLE_ID = "app-load-prehide";

export function buildAppLoadPrehideCss(appLoad: AppLoadSpec): string | null {
  if (appLoad.mode === "none") return null;

  if (appLoad.mode === "simple") {
    if (appLoad.simple.type === "none" || appLoad.simple.opacityFrom >= 100) return null;
    return `@media (prefers-reduced-motion: no-preference) { .app-load-host { opacity: 0; } }`;
  }

  const selectors = appLoad.elements.regions
    .filter((region) => region.enabled && region.opacityFrom < 100)
    .map((region) => region.selector);

  if (selectors.length === 0) return null;

  const uniqueSelectors = [...new Set(selectors)];
  return `@media (prefers-reduced-motion: no-preference) { ${uniqueSelectors.join(", ")} { opacity: 0; } }`;
}

export function removeAppLoadPrehideStyles() {
  if (typeof document === "undefined") return;
  document.getElementById(APP_LOAD_PREHIDE_STYLE_ID)?.remove();
}
