"use client";

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "@/modules/notifications/components/notification-dropdown";
import { useUnreadNotificationCount } from "@/modules/notifications/hooks/use-notifications";
import { cn } from "@/shared/lib/cn";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground",
          open && "text-foreground",
        )}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-primary bg-background px-1 text-[10px] font-semibold text-primary">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
        containerRef={containerRef}
      />
    </div>
  );
}
