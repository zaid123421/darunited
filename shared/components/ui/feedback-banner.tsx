"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface FeedbackBannerProps {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export function FeedbackBanner({ type, message, onDismiss }: FeedbackBannerProps) {
  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
            isSuccess
              ? "text-emerald-300/80 hover:bg-emerald-500/15 hover:text-emerald-200"
              : "text-destructive/80 hover:bg-destructive/15 hover:text-destructive",
          )}
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
