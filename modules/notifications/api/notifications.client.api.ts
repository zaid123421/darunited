import { clientFetch } from "@/shared/lib/api/client";
import type {
  DeleteFirebaseTokenPayload,
  NotificationListData,
  NotificationUnreadCountData,
  RegisterFirebaseTokenPayload,
} from "@/modules/notifications/types";

function buildNotificationsQuery(perPage: number, page: number) {
  return `?per_page=${perPage}&page=${page}`;
}

export const notificationsClientApi = {
  list: (perPage = 15, page = 1) =>
    clientFetch<NotificationListData>(
      `/api/admin/notifications${buildNotificationsQuery(perPage, page)}`,
    ),

  unreadCount: () =>
    clientFetch<NotificationUnreadCountData>(
      "/api/admin/notifications/unread-count",
    ),

  markAsRead: (notificationId: number) =>
    clientFetch<null>(`/api/admin/notifications/${notificationId}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    clientFetch<null>("/api/admin/notifications/mark-all-as-read", {
      method: "PATCH",
    }),

  delete: (notificationId: number) =>
    clientFetch<null>(`/api/admin/notifications/${notificationId}`, {
      method: "DELETE",
    }),

  registerToken: (payload: RegisterFirebaseTokenPayload) =>
    clientFetch<null>("/api/admin/firebase-device-tokens", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteToken: (payload: DeleteFirebaseTokenPayload) =>
    clientFetch<null>("/api/admin/firebase-device-tokens", {
      method: "DELETE",
      body: JSON.stringify(payload),
    }),
};
