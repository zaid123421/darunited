"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 300;

interface NewNotificationModalProps {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export function NewNotificationModal({
  open,
  title,
  body,
  onClose,
}: NewNotificationModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let unmountTimer: ReturnType<typeof setTimeout> | undefined;

    setIsRendered(true);

    const showTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      unmountTimer = setTimeout(() => {
        setIsRendered(false);
        onClose();
      }, EXIT_ANIMATION_MS);
    }, AUTO_DISMISS_MS);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [body, onClose, open, title]);

  function dismissNow() {
    setIsVisible(false);
    window.setTimeout(() => {
      setIsRendered(false);
      onClose();
    }, EXIT_ANIMATION_MS);
  }

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))]"
      aria-live="polite"
    >
      <div
        role="status"
        aria-labelledby="new-notification-title"
        aria-describedby="new-notification-description"
        className={cn(
          "pointer-events-auto rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/10",
          "transform transition-all duration-300 ease-out",
          isVisible
            ? "translate-x-0 translate-y-0 opacity-100"
            : "translate-x-[calc(100%+1rem)] translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p
              id="new-notification-title"
              className="text-xs font-semibold uppercase tracking-wide text-primary"
            >
              New notification
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
            {body ? (
              <p
                id="new-notification-description"
                className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground"
              >
                {body}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={dismissNow}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
