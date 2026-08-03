"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  PWA_PREFS_CHANGED_EVENT,
  readBadgeEnabled,
  readPushEnabled,
  urlBase64ToUint8Array,
  writeBadgeEnabled,
  writePushEnabled,
} from "@/lib/pwa/notification-preferences";

type PermissionState = NotificationPermission | "unsupported";

export function NotificationSettings() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [badgesEnabled, setBadgesEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [standalone, setStandalone] = useState(false);

  const refresh = useCallback(() => {
    setBadgesEnabled(readBadgeEnabled());
    setPushEnabled(readPushEnabled());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(PWA_PREFS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(PWA_PREFS_CHANGED_EVENT, refresh);
  }, [refresh]);

  async function ensureServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    return navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready);
  }

  async function enablePushNotifications() {
    setBusy(true);
    try {
      if (!("Notification" in window)) {
        toast.error("Notifications are not supported in this browser.");
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        toast.error("Notification permission was not granted.");
        return;
      }

      const registration = await ensureServiceWorker();
      if (!registration) {
        toast.error("Install the app or refresh to register the service worker first.");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (vapidPublicKey && "pushManager" in registration) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        if (!response.ok) {
          throw new Error("Failed to save push subscription.");
        }
      }

      writePushEnabled(true);
      setPushEnabled(true);
      toast.success("Push notifications enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not enable push notifications.");
    } finally {
      setBusy(false);
      refresh();
    }
  }

  async function toggleBadges(checked: boolean) {
    writeBadgeEnabled(checked);
    setBadgesEnabled(checked);

    if (!checked && "clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
    } else if (checked) {
      const registration = await ensureServiceWorker();
      registration?.active?.postMessage({ type: "SYNC_ORDER_WINDOW_BADGE" });
    }

    toast.success(checked ? "App icon badges enabled." : "App icon badges disabled.");
  }

  const permissionLabel =
    permission === "granted"
      ? "Allowed"
      : permission === "denied"
        ? "Blocked"
        : permission === "default"
          ? "Not asked yet"
          : "Unsupported";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Push notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get alerts when the menu opens, your order is on the way, and other delivery updates.
            </p>
            <p className="mt-3 text-sm">
              Status: <span className="font-medium">{permissionLabel}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="mt-4 h-11 w-full"
          disabled={busy || permission === "granted" || permission === "unsupported"}
          onClick={() => void enablePushNotifications()}
        >
          {permission === "granted" ? "Notifications enabled" : "Enable push notifications"}
        </Button>
        {!standalone ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            For the best experience, add Dinnerz Done to your home screen first, then enable
            notifications here.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-100">
            <BadgeCheck className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">App icon badges</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Show a badge on the installed app icon when the menu is open for ordering. In-app
              status dots on Dinner and Track still show green, red, and purple when badges are off.
            </p>
          </div>
        </div>
        <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
          <span className="text-sm font-medium">Enable PWA app icon badges</span>
          <Switch checked={badgesEnabled} onCheckedChange={(checked) => void toggleBadges(checked)} />
        </label>
        {pushEnabled ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Push subscription saved{permission === "granted" ? " and active" : ""}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
