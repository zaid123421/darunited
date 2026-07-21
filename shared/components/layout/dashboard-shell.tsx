"use client";

import { useCallback, useEffect, useState } from "react";
import { SessionBootstrap } from "@/shared/components/auth/session-bootstrap";
import { NotificationProvider } from "@/modules/notifications/components/notification-provider";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { Topbar } from "@/shared/components/layout/topbar";
import { cn } from "@/shared/lib/cn";

const SIDEBAR_OPEN_STORAGE_KEY = "dashboard-sidebar-open";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpenState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
    if (stored === "true") {
      setSidebarOpenState(true);
    } else if (stored === "false") {
      setSidebarOpenState(false);
    }
  }, []);

  const setSidebarOpen = useCallback((next: boolean | ((current: boolean) => boolean)) => {
    setSidebarOpenState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(value));
      return value;
    });
  }, []);

  function closeSidebarIfMobile() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSidebarOpen(false);
    }
  }

  return (
    <SessionBootstrap>
    <NotificationProvider>
    <div className="flex min-h-screen bg-background">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      ) : null}

      <Sidebar
        open={sidebarOpen}
        onNavigate={closeSidebarIfMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-200",
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-0",
        )}
      >
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((current) => !current)}
        />
        <main className="app-scrollbar flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
    </NotificationProvider>
    </SessionBootstrap>
  );
}
