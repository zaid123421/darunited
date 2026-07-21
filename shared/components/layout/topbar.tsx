"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { useCurrentUser } from "@/modules/auth/hooks/use-current-user";
import { getUserInitials } from "@/shared/lib/auth/user";

type TopbarProps = {
  sidebarOpen?: boolean;
  onMenuClick?: () => void;
};

export function Topbar({ sidebarOpen = true, onMenuClick }: TopbarProps) {
  const user = useCurrentUser();
  const initials = getUserInitials(user?.user_name ?? "User");
  const ToggleIcon = sidebarOpen ? ChevronLeft : ChevronRight;

  return (
    <header className="sticky top-0 z-40 flex h-[77px] items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-border bg-muted p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          <ToggleIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              {user?.user_name ?? "—"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user?.role ?? "—"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
