const ORDER_WINDOW_URL = "/api/order-window";

let badgesEnabled = true;

async function syncOrderWindowBadge() {
  if (!("setAppBadge" in self.registration)) return;
  if (!badgesEnabled) {
    await self.registration.clearAppBadge();
    return;
  }

  try {
    const response = await fetch(ORDER_WINDOW_URL);
    if (!response.ok) return;

    const { open } = await response.json();
    if (open) {
      await self.registration.setAppBadge();
    } else {
      await self.registration.clearAppBadge();
    }
  } catch {
    // Ignore network failures when the app is offline or sleeping.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([self.clients.claim(), syncOrderWindowBadge()]));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SYNC_ORDER_WINDOW_BADGE") {
    if (typeof event.data.badgesEnabled === "boolean") {
      badgesEnabled = event.data.badgesEnabled;
    }
    event.waitUntil(syncOrderWindowBadge());
  }
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json?.() ?? {};
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Dinnerz Done", {
      body: payload.body ?? "You have an update from Dinnerz Done.",
      icon: "/icon",
      badge: "/icon",
      data: payload.url ? { url: payload.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
