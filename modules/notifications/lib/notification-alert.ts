import type { FirebaseMessagePayload } from "@/modules/notifications/types";

export const DEFAULT_NOTIFICATION_TITLE = "DARUNITED";
export const DEFAULT_NOTIFICATION_BODY = "You have a new notification.";

export interface NotificationAlertContent {
  title: string;
  body: string;
}

export function parseNotificationAlert(
  payload?: FirebaseMessagePayload,
): NotificationAlertContent {
  return {
    title: payload?.notification?.title ?? DEFAULT_NOTIFICATION_TITLE,
    body: payload?.notification?.body ?? DEFAULT_NOTIFICATION_BODY,
  };
}

export function parseNotificationId(
  payload?: FirebaseMessagePayload,
): number | undefined {
  const rawId = payload?.data?.notificationId;

  if (!rawId) {
    return undefined;
  }

  const id = Number(rawId);

  return Number.isFinite(id) ? id : undefined;
}

export function createNotificationAlertTracker(maxTrackedIds = 50) {
  const alertedIds = new Set<number>();

  return {
    hasAlerted(notificationId: number) {
      return alertedIds.has(notificationId);
    },
    markAlerted(notificationId: number) {
      alertedIds.add(notificationId);

      if (alertedIds.size > maxTrackedIds) {
        const oldestId = alertedIds.values().next().value;

        if (oldestId !== undefined) {
          alertedIds.delete(oldestId);
        }
      }
    },
  };
}
