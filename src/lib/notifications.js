const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
// console.log("VAPID KEY:", import.meta.env.VITE_VAPID_PUBLIC_KEY);
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window))
    return { error: "Notifications not supported" };
  if (!("serviceWorker" in navigator))
    return { error: "Service worker not supported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { error: "Permission denied" };

  return { success: true };
}

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) return { subscription: existing };

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    return { subscription };
  } catch (err) {
    return { error: err.message };
  }
}

export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

export function getNotificationStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission; // 'default' | 'granted' | 'denied'
}
