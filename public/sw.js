// public/sw.js
// Service worker for BD SaaS Zone web push notifications.
// This file must be at the root of your public folder.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "BD SaaS Zone", body: event.data.text() };
  }

  const options = {
    body: data.body ?? "",
    icon: data.icon ?? "/logo.svg",
    badge: "/logo.svg",
    data: { url: data.url ?? "/" },
    vibrate: [100, 50, 100],
    tag: data.tag ?? "bdsaaszone",        // replaces previous notification of same tag
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "BD SaaS Zone", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the site is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});