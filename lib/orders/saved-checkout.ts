import type { DeliveryAddressFields } from "@/lib/orders/address";

const SAVED_CHECKOUT_KEY = "dinnerz-saved-checkout";
const DENY_SAVE_CHECKOUT_KEY = "dinnerz-deny-save-checkout";

export type SavedCheckoutDetails = {
  customerName: string;
  phone: string;
  email: string;
  address: DeliveryAddressFields;
};

export function isSaveDenied() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DENY_SAVE_CHECKOUT_KEY) === "1";
}

export function loadSavedCheckout(): SavedCheckoutDetails | null {
  if (typeof window === "undefined" || isSaveDenied()) return null;

  try {
    const raw = localStorage.getItem(SAVED_CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCheckoutDetails;
  } catch {
    return null;
  }
}

export function persistCheckoutDetails(details: SavedCheckoutDetails) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DENY_SAVE_CHECKOUT_KEY);
  localStorage.setItem(SAVED_CHECKOUT_KEY, JSON.stringify(details));
}

export function clearSavedCheckoutDetails() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SAVED_CHECKOUT_KEY);
}

export function setSaveDenied(denied: boolean) {
  if (typeof window === "undefined") return;
  if (denied) {
    localStorage.setItem(DENY_SAVE_CHECKOUT_KEY, "1");
    clearSavedCheckoutDetails();
    return;
  }
  localStorage.removeItem(DENY_SAVE_CHECKOUT_KEY);
}
