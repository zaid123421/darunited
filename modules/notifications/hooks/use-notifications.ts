import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsClientApi } from "@/modules/notifications/api/notifications.client.api";
import { NOTIFICATIONS_ENABLED } from "@/modules/notifications/constants";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (perPage: number) =>
    [...notificationQueryKeys.all, "list", perPage] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
};

const notificationQueryOptions = {
  enabled: NOTIFICATIONS_ENABLED,
  staleTime: 0,
  refetchOnWindowFocus: NOTIFICATIONS_ENABLED,
} as const;

const NOTIFICATIONS_PER_PAGE = 10;

export function useInfiniteNotifications(perPage = NOTIFICATIONS_PER_PAGE) {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(perPage),
    queryFn: async ({ pageParam }) => {
      const response = await notificationsClientApi.list(perPage, pageParam);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.current_page + 1
        : undefined,
    ...notificationQueryOptions,
    refetchInterval: NOTIFICATIONS_ENABLED ? 30_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: async () => {
      const response = await notificationsClientApi.unreadCount();
      return response.data.count;
    },
    ...notificationQueryOptions,
    refetchInterval: NOTIFICATIONS_ENABLED ? 15_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationsClientApi.markAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsClientApi.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationsClientApi.delete(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}
