"use client";

import { useEffect, useRef } from "react";
import {
  ensureFcmTokenRegistered,
  type FcmRegistrationResult,
} from "@/modules/notifications/lib/fcm-token";
import { logNotificationDebug } from "@/modules/notifications/lib/notification-debug";
import {
  getMissingFirebaseEnvKeys,
  isFirebaseConfigured,
} from "@/shared/config/firebase";

const FOCUS_REREGISTER_MS = 5 * 60 * 1000;

export function useFcmRegistration() {
  const lastAttemptAtRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      const missingKeys = getMissingFirebaseEnvKeys();

      logNotificationDebug("Firebase is not configured; skipping FCM registration", {
        missingKeys,
      });
      return;
    }

    async function attemptRegistration(trigger: string) {
      if (inFlightRef.current) {
        return;
      }

      const now = Date.now();

      if (now - lastAttemptAtRef.current < 2_000) {
        return;
      }

      inFlightRef.current = true;
      lastAttemptAtRef.current = now;

      try {
        const result = await ensureFcmTokenRegistered();
        logRegistrationResult(trigger, result);
      } finally {
        inFlightRef.current = false;
      }
    }

    function handleUserInteraction() {
      void attemptRegistration("user-interaction");
    }

    function handleWindowFocus() {
      if (Date.now() - lastAttemptAtRef.current < FOCUS_REREGISTER_MS) {
        return;
      }

      void attemptRegistration("window-focus");
    }

    void attemptRegistration("mount");

    document.addEventListener("pointerdown", handleUserInteraction, {
      once: true,
    });
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);
}

function logRegistrationResult(trigger: string, result: FcmRegistrationResult) {
  if (result.ok) {
    logNotificationDebug(`FCM registration succeeded (${trigger})`, {
      syncedWithBackend: result.syncedWithBackend,
      tokenLength: result.token.length,
    });
    return;
  }

  logNotificationDebug(`FCM registration skipped (${trigger})`, {
    reason: result.reason,
  });
}
