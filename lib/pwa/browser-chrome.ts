export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export type InstallKind = "ios" | "android" | "desktop-safari" | "desktop-chromium";

export function canShowAddToHomeScreen() {
  if (typeof window === "undefined") return false;
  return !isStandaloneApp();
}

export function detectInstallKind(): InstallKind {
  if (typeof window === "undefined") return "ios";

  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIos) return "ios";

  if (/Android/i.test(ua)) return "android";

  const isSafari =
    /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
  if (isSafari) return "desktop-safari";

  return "desktop-chromium";
}

export function installMenuLabel(kind: InstallKind) {
  if (kind === "desktop-safari") return "Add to Dock";
  if (kind === "desktop-chromium") return "Install App";
  return "Add to Home Screen";
}
