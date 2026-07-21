import { deleteToken, getToken } from "firebase/messaging";
import { notificationsClientApi } from "@/modules/notifications/api/notifications.client.api";
import { getFirebaseMessaging } from "@/modules/notifications/lib/firebase";
import {
  logNotificationDebug,
  maskFcmToken,
} from "@/modules/notifications/lib/notification-debug";
import {
  firebaseEnv,
  isFirebaseConfigured,
} from "@/shared/config/firebase";

const FCM_TOKEN_STORAGE_KEY = "du_fcm_token";
const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";
const MAX_REGISTRATION_ATTEMPTS = 3;

export type FcmRegistrationFailureReason =
  | "unsupported"
  | "firebase_not_configured"
  | "missing_vapid_key"
  | "permission_denied"
  | "messaging_unavailable"
  | "service_worker_unavailable"
  | "token_unavailable"
  | "invalid_token"
  | "backend_registration_failed";

export type FcmRegistrationResult =
  | {
      ok: true;
      token: string;
      syncedWithBackend: boolean;
    }
  | {
      ok: false;
      reason: FcmRegistrationFailureReason;
      error?: unknown;
    };

export function getStoredFcmToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

export function isValidFcmToken(token: string) {
  return (
    token.length >= 100 &&
    !/\s/.test(token) &&
    token !== "undefined" &&
    token !== "null"
  );
}

async function getMessagingServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const existingRegistrations = await navigator.serviceWorker.getRegistrations();
  const existingMessagingWorker = existingRegistrations.find((registration) =>
    registration.active?.scriptURL.includes("firebase-messaging-sw.js"),
  );

  if (existingMessagingWorker) {
    return existingMessagingWorker;
  }

  return navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
    scope: "/",
  });
}

async function syncTokenWithBackend(token: string) {
  const storedToken = getStoredFcmToken();

  if (storedToken === token) {
    logNotificationDebug("FCM token already synced with backend", {
      token: maskFcmToken(token),
    });

    return false;
  }

  await notificationsClientApi.registerToken({
    token,
    platform: "web",
    deviceName: navigator.userAgent.slice(0, 255),
  });

  sessionStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

  logNotificationDebug("FCM token registered with backend", {
    token: maskFcmToken(token),
  });

  return true;
}

export async function registerFcmToken(): Promise<FcmRegistrationResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "firebase_not_configured" };
  }

  if (!firebaseEnv.vapidKey) {
    return { ok: false, reason: "missing_vapid_key" };
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== "granted") {
    return { ok: false, reason: "permission_denied" };
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return { ok: false, reason: "messaging_unavailable" };
  }

  try {
    const registration = await getMessagingServiceWorkerRegistration();

    if (!registration) {
      return { ok: false, reason: "service_worker_unavailable" };
    }

    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: firebaseEnv.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { ok: false, reason: "token_unavailable" };
    }

    if (!isValidFcmToken(token)) {
      return { ok: false, reason: "invalid_token" };
    }

    logNotificationDebug("FCM token acquired", {
      token: maskFcmToken(token),
      length: token.length,
    });

    try {
      const syncedWithBackend = await syncTokenWithBackend(token);

      return {
        ok: true,
        token,
        syncedWithBackend,
      };
    } catch (error) {
      logNotificationDebug("FCM backend sync failed", error);

      return {
        ok: false,
        reason: "backend_registration_failed",
        error,
      };
    }
  } catch (error) {
    logNotificationDebug("FCM token acquisition failed", error);

    return {
      ok: false,
      reason: "token_unavailable",
      error,
    };
  }
}

export async function ensureFcmTokenRegistered(): Promise<FcmRegistrationResult> {
  let lastResult: FcmRegistrationResult = {
    ok: false,
    reason: "token_unavailable",
  };

  for (let attempt = 1; attempt <= MAX_REGISTRATION_ATTEMPTS; attempt += 1) {
    lastResult = await registerFcmToken();

    if (lastResult.ok) {
      return lastResult;
    }

    if (
      lastResult.reason === "permission_denied" ||
      lastResult.reason === "unsupported" ||
      lastResult.reason === "firebase_not_configured" ||
      lastResult.reason === "missing_vapid_key"
    ) {
      return lastResult;
    }

    if (attempt < MAX_REGISTRATION_ATTEMPTS) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, attempt * 1000);
      });
    }
  }

  return lastResult;
}

export async function unregisterFcmToken(): Promise<void> {
  const token = getStoredFcmToken();

  if (!token) {
    return;
  }

  try {
    await notificationsClientApi.deleteToken({ token });
  } catch {
    // Best-effort backend cleanup.
  }

  try {
    const messaging = await getFirebaseMessaging();

    if (messaging) {
      await deleteToken(messaging);
    }
  } catch {
    // Best-effort local cleanup.
  }

  sessionStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
}
