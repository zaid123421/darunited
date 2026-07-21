"use client";

import { useEffect, useState, type RefObject } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MailOpen, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import {
  useDeleteNotification,
  useInfiniteNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/modules/notifications/hooks/use-notifications";
import { formatNotificationDate } from "@/modules/notifications/lib/format-notification-date";
import { resolveNotificationHref } from "@/modules/notifications/lib/resolve-notification-href";
import type {
  NotificationItem,
  NotificationListData,
} from "@/modules/notifications/types";

function mergeNotificationPages(
  pages: NotificationListData[] | undefined,
): NotificationItem[] {
  if (!pages?.length) {
    return [];
  }

  const seen = new Set<number>();
  const merged: NotificationItem[] = [];

  for (const page of pages) {
    for (const notification of page.notifications) {
      if (seen.has(notification.id)) {
        continue;
      }

      seen.add(notification.id);
      merged.push(notification);
    }
  }

  return merged;
}

type NotificationDropdownProps = {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export function NotificationDropdown({
  open,
  onClose,
  containerRef,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [notificationToDelete, setNotificationToDelete] =
    useState<NotificationItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      void refetch();
    }
  }, [open, refetch]);

  useEffect(() => {
    if (!open || isFetchingNextPage) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (notificationToDelete) {
        return;
      }

      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !notificationToDelete) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [containerRef, isFetchingNextPage, notificationToDelete, onClose, open]);

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.readAt) {
      await markAsRead.mutateAsync(notification.id);
    }

    onClose();

    if (!notification.clickable) {
      return;
    }

    const href = resolveNotificationHref(notification.page);

    if (href) {
      router.push(href);
    }
  }

  function handleMarkAsRead(
    event: ReactMouseEvent<HTMLButtonElement>,
    notificationId: number,
  ) {
    event.stopPropagation();
    markAsRead.mutate(notificationId);
  }

  function handleDeleteConfirm() {
    if (!notificationToDelete) {
      return;
    }

    deleteNotification.mutate(notificationToDelete.id, {
      onSuccess: () => {
        setNotificationToDelete(null);
      },
    });
  }

  const notifications = mergeNotificationPages(data?.pages);
  const hasMore = Boolean(hasNextPage);

  const deleteDialog =
    mounted && notificationToDelete
      ? createPortal(
          <ConfirmDialog
            open
            title="Delete notification"
            description={`Are you sure you want to delete "${notificationToDelete.title}"?`}
            confirmLabel="Delete"
            loading={deleteNotification.isPending}
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              if (!deleteNotification.isPending) {
                setNotificationToDelete(null);
              }
            }}
          />,
          document.body,
        )
      : null;

  if (!open) {
    return deleteDialog;
  }

  return (
    <>
      <div
        className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending || notifications.length === 0}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>

        <div className="app-scrollbar max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : null}

          {isError ? (
            <p className="px-4 py-6 text-center text-sm text-destructive">
              Could not load notifications.
            </p>
          ) : null}

          {!isLoading && !isError && notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : null}

          {!isLoading && !isError
            ? notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex items-start gap-2 border-b border-border px-4 py-3 last:border-b-0",
                    !notification.readAt && "bg-primary/5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left transition-colors hover:opacity-80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground",
                          !notification.readAt && "font-semibold",
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.readAt ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {notification.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </button>

                  <div className="mt-0.5 flex shrink-0 items-center gap-0.5">
                    {!notification.readAt ? (
                      <button
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) =>
                          handleMarkAsRead(event, notification.id)
                        }
                        disabled={
                          markAsRead.isPending &&
                          markAsRead.variables === notification.id
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-100 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        aria-label={`Mark ${notification.title} as read`}
                        title="Mark as read"
                      >
                        <MailOpen className="h-4 w-4" />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setNotificationToDelete(notification);
                      }}
                      disabled={deleteNotification.isPending}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-100 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      aria-label={`Delete ${notification.title}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            : null}

          {hasMore ? (
            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  void fetchNextPage();
                }}
                disabled={isFetchingNextPage}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {deleteDialog}
    </>
  );
}
