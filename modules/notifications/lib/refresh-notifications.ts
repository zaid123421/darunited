import type { QueryClient } from "@tanstack/react-query";
import { notificationQueryKeys } from "@/modules/notifications/hooks/use-notifications";

export const NOTIFICATION_RECEIVED_MESSAGE = "MN_NOTIFICATION_RECEIVED";

export interface NotificationReceivedMessage {
  type: typeof NOTIFICATION_RECEIVED_MESSAGE;
  title?: string;
  body?: string;
  notificationId?: string;
}

export function refreshNotifications(queryClient: QueryClient) {
  return queryClient.refetchQueries({
    queryKey: notificationQueryKeys.all,
    type: "active",
  });
}

export function isNotificationReceivedMessage(
  data: unknown,
): data is NotificationReceivedMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === NOTIFICATION_RECEIVED_MESSAGE
  );
}
