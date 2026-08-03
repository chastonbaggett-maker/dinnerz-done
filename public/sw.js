const ORDER_WINDOW_URL = "/api/order-window";

async function syncOrderWindowBadge() {
  if (!("setAppBadge" in self.registration)) return;

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
    event.waitUntil(syncOrderWindowBadge());
  }
});
