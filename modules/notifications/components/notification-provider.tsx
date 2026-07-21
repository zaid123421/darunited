"use client";

import { NewNotificationModal } from "@/modules/notifications/components/new-notification-modal";
import {
  DEFAULT_NOTIFICATION_BODY,
  DEFAULT_NOTIFICATION_TITLE,
} from "@/modules/notifications/lib/notification-alert";
import { useNotificationAlerts } from "@/modules/notifications/hooks/use-notification-alerts";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notificationAlert, dismissAlert } = useNotificationAlerts();

  return (
    <>
      {children}
      <NewNotificationModal
        open={notificationAlert !== null}
        title={notificationAlert?.title ?? DEFAULT_NOTIFICATION_TITLE}
        body={notificationAlert?.body ?? DEFAULT_NOTIFICATION_BODY}
        onClose={dismissAlert}
      />
    </>
  );
}
