"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onMessage } from "firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsClientApi } from "@/modules/notifications/api/notifications.client.api";
import { getFirebaseMessaging } from "@/modules/notifications/lib/firebase";
import { useFcmRegistration } from "@/modules/notifications/hooks/use-fcm-registration";
import {
  createNotificationAlertTracker,
  DEFAULT_NOTIFICATION_BODY,
  DEFAULT_NOTIFICATION_TITLE,
  parseNotificationAlert,
  parseNotificationId,
  type NotificationAlertContent,
} from "@/modules/notifications/lib/notification-alert";
import {
  playNotificationSound,
  unlockNotificationSound,
} from "@/modules/notifications/lib/play-notification-sound";
import {
  isNotificationReceivedMessage,
  refreshNotifications,
} from "@/modules/notifications/lib/refresh-notifications";
import { useUnreadNotificationCount } from "@/modules/notifications/hooks/use-notifications";
import type { FirebaseMessagePayload } from "@/modules/notifications/types";
import { isFirebaseConfigured } from "@/shared/config/firebase";

const POLL_ALERT_SKIP_MS = 20_000;

export function useNotificationAlerts() {
  const queryClient = useQueryClient();
  useFcmRegistration();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [notificationAlert, setNotificationAlert] =
    useState<NotificationAlertContent | null>(null);

  const alertTrackerRef = useRef(createNotificationAlertTracker());
  const previousUnreadCountRef = useRef<number | null>(null);
  const unreadCountInitializedRef = useRef(false);
  const skipPollAlertUntilRef = useRef(0);

  const showAlert = useCallback((alert: NotificationAlertContent) => {
    playNotificationSound();
    setNotificationAlert(alert);
  }, []);

  const showAlertForNotification = useCallback(
    (alert: NotificationAlertContent, notificationId?: number) => {
      if (notificationId !== undefined) {
        const tracker = alertTrackerRef.current;

        if (tracker.hasAlerted(notificationId)) {
          return false;
        }

        tracker.markAlerted(notificationId);
      }

      showAlert(alert);
      return true;
    },
    [showAlert],
  );

  const handlePushNotification = useCallback(
    (payload?: FirebaseMessagePayload) => {
      skipPollAlertUntilRef.current = Date.now() + POLL_ALERT_SKIP_MS;

      showAlertForNotification(
        parseNotificationAlert(payload),
        parseNotificationId(payload),
      );
      void refreshNotifications(queryClient);
    },
    [queryClient, showAlertForNotification],
  );

  useEffect(() => {
    if (!unreadCountInitializedRef.current) {
      unreadCountInitializedRef.current = true;
      previousUnreadCountRef.current = unreadCount;
      return;
    }

    const previousCount = previousUnreadCountRef.current ?? 0;
    previousUnreadCountRef.current = unreadCount;

    if (unreadCount <= previousCount) {
      return;
    }

    if (Date.now() < skipPollAlertUntilRef.current) {
      return;
    }

    void (async () => {
      try {
        const response = await notificationsClientApi.list(5, 1);
        const newestUnread =
          response.data.notifications.find((notification) => !notification.readAt) ??
          response.data.notifications[0];

        if (!newestUnread) {
          showAlert({
            title: DEFAULT_NOTIFICATION_TITLE,
            body: DEFAULT_NOTIFICATION_BODY,
          });
          return;
        }

        showAlertForNotification(
          {
            title: newestUnread.title,
            body: newestUnread.body,
          },
          newestUnread.id,
        );
      } catch {
        showAlert({
          title: DEFAULT_NOTIFICATION_TITLE,
          body: DEFAULT_NOTIFICATION_BODY,
        });
      }
    })();
  }, [showAlert, showAlertForNotification, unreadCount]);

  useEffect(() => {
    const unlock = () => unlockNotificationSound();

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    function handleNotificationReceived() {
      void refreshNotifications(queryClient);
    }

    function handleServiceWorkerMessage(event: MessageEvent) {
      if (!isNotificationReceivedMessage(event.data)) {
        return;
      }

      const notificationId = event.data.notificationId
        ? Number(event.data.notificationId)
        : undefined;

      handlePushNotification({
        notification: {
          title: event.data.title,
          body: event.data.body,
        },
        data: Number.isFinite(notificationId)
          ? { notificationId: String(notificationId) }
          : undefined,
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        handleNotificationReceived();
      }
    }

    navigator.serviceWorker?.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleNotificationReceived);

    void (async () => {
      if (cancelled) {
        return;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging || cancelled) {
        return;
      }

      unsubscribe = onMessage(messaging, (payload) => {
        handlePushNotification(payload as FirebaseMessagePayload);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      navigator.serviceWorker?.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleNotificationReceived);
    };
  }, [handlePushNotification, queryClient]);

  const dismissAlert = useCallback(() => {
    setNotificationAlert(null);
  }, []);

  return {
    notificationAlert,
    dismissAlert,
  };
}
