import { firebaseConfig, isFirebaseConfigured } from "@/shared/config/firebase";

const FIREBASE_VERSION = "12.15.0";

function buildServiceWorkerScript() {
  const config = JSON.stringify(firebaseConfig);

  return `
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js");

firebase.initializeApp(${config});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "DARUNITED";
  const options = {
    body: payload.notification?.body ?? "",
    icon: "/favicons/android-chrome-192x192.png",
    data: payload.data ?? {},
  };

  self.registration.showNotification(title, options);

  self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
    for (const client of windowClients) {
      client.postMessage({
        type: "MN_NOTIFICATION_RECEIVED",
        title: payload.notification?.title,
        body: payload.notification?.body,
        notificationId: payload.data?.notificationId,
      });
    }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const page = event.notification.data?.page;

  if (!page) {
    return;
  }

  const href = page.startsWith("/dashboard")
    ? page
    : page.startsWith("/contact-messages/")
      ? "/dashboard/messages/" + page.slice("/contact-messages/".length)
      : "/dashboard" + (page.startsWith("/") ? page : "/" + page);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(href);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(href);
      }
    }),
  );
});
`.trim();
}

export async function GET() {
  if (!isFirebaseConfigured()) {
    return new Response("// Firebase is not configured", {
      status: 404,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }

  return new Response(buildServiceWorkerScript(), {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-store",
    },
  });
}
