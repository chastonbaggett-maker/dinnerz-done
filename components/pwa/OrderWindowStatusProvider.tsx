"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const OrderWindowStatusContext = createContext<boolean | null>(null);
const DeliveryInRouteContext = createContext(false);

export function useOrderWindowOpen() {
  return useContext(OrderWindowStatusContext);
}

export function useDeliveryInRoute() {
  return useContext(DeliveryInRouteContext);
}

async function syncOrderWindowBadge(isOpen: boolean) {
  if ("setAppBadge" in navigator) {
    if (isOpen) {
      await navigator.setAppBadge();
    } else {
      await navigator.clearAppBadge();
    }
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.active?.postMessage({ type: "SYNC_ORDER_WINDOW_BADGE" });
  }
}

export function OrderWindowStatusProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState<boolean | null>(null);
  const [deliveryInRoute, setDeliveryInRoute] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncOrderWindow() {
      try {
        const response = await fetch("/api/order-window", { cache: "no-store" });
        if (!response.ok || cancelled) return;

        const { open: isOpen } = (await response.json()) as { open: boolean };
        if (cancelled) return;

        setOpen(isOpen);
        await syncOrderWindowBadge(isOpen);
      } catch {
        // Ignore transient fetch failures.
      }
    }

    async function syncDeliveryRoute() {
      if (!isSignedIn) {
        setDeliveryInRoute(false);
        return;
      }

      try {
        const response = await fetch("/api/delivery-route-status", { cache: "no-store" });
        if (!response.ok || cancelled) return;

        const { inRoute } = (await response.json()) as { inRoute: boolean };
        if (cancelled) return;

        setDeliveryInRoute(inRoute);
      } catch {
        // Ignore transient fetch failures.
      }
    }

    async function sync() {
      await Promise.all([syncOrderWindow(), syncDeliveryRoute()]);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    sync();
    const intervalId = window.setInterval(sync, 60_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isSignedIn]);

  return (
    <OrderWindowStatusContext.Provider value={open}>
      <DeliveryInRouteContext.Provider value={deliveryInRoute}>
        {children}
      </DeliveryInRouteContext.Provider>
    </OrderWindowStatusContext.Provider>
  );
}
