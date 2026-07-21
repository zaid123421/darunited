"use client";

import { useCallback, useEffect, useState } from "react";
import type { StoredAuthUser } from "@/modules/auth/types";
import { clientSession } from "@/shared/lib/auth/client-session";

function readStoredUser() {
  return clientSession.getUser<StoredAuthUser>();
}

export function useCurrentUser() {
  const [user, setUser] = useState<StoredAuthUser | null>(null);

  const syncUser = useCallback(() => {
    const next = readStoredUser();

    setUser((current) => {
      if (
        current?.user_name === next?.user_name &&
        current?.role === next?.role
      ) {
        return current;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    syncUser();

    window.addEventListener("du-user-session-change", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("du-user-session-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [syncUser]);

  return user;
}
