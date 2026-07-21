"use client";

import { useEffect, useState } from "react";
import { bootstrapClientSession } from "@/shared/lib/auth/session-bootstrap";
import { handleClientUnauthenticated } from "@/shared/lib/auth/unauthenticated";

export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void bootstrapClientSession().then((result) => {
      if (cancelled) {
        return;
      }

      if (result === "unauthenticated") {
        handleClientUnauthenticated();
        return;
      }

      // "ok" or a transient "error" (network): render and let subsequent
      // requests refresh or redirect as needed.
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return children;
}
