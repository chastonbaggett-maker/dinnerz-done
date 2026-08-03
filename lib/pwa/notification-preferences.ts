export const PWA_PREFS_CHANGED_EVENT = "dd:pwa-prefs-changed";

const BADGE_KEY = "dd:pwa-badges-enabled";
const PUSH_KEY = "dd:push-notifications-enabled";

export function readBadgeEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(BADGE_KEY) !== "false";
}

export function writeBadgeEnabled(enabled: boolean) {
  localStorage.setItem(BADGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent(PWA_PREFS_CHANGED_EVENT));
}

export function readPushEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PUSH_KEY) === "true";
}

export function writePushEnabled(enabled: boolean) {
  localStorage.setItem(PUSH_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent(PWA_PREFS_CHANGED_EVENT));
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
