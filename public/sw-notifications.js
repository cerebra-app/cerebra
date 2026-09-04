// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = "/";

  switch (data.type) {
    case "task_due":
    case "task_overdue":
      url = "/app/tasks";
      break;
    case "journal_reminder":
    case "streak_risk":
    case "streak_milestone":
      url = "/app/home";
      break;
    case "mindfulness":
      url = "/app/home";
      break;
    default:
      url = "/app/home";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

// Push event handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/pwa-192x192.png",
    badge: "/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: { type: data.type, url: data.url },
    actions: data.actions || [],
    tag: data.tag || "thala-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
