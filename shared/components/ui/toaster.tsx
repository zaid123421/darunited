"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-foreground shadow-lg font-sans",
          title: "text-foreground",
          description: "text-muted-foreground",
          success: "border-primary/40",
          error: "border-destructive/40",
          closeButton: "border-border bg-muted text-foreground",
        },
      }}
    />
  );
}
