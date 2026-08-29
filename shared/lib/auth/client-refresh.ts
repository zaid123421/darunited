import { buildBackendApiUrl, env } from "@/shared/config/env";
import { clientSession } from "@/shared/lib/auth/client-session";
import { syncSessionFromCookies } from "@/shared/lib/auth/session-bootstrap";
import type { RefreshTokenData } from "@/modules/auth/types";
import type { GlobalResponse } from "@/shared/types/global-response";

const AUTH_PATHS_WITHOUT_REFRESH = [
  "/auth/refresh",
  "/auth/request-code",
  "/auth/verify-code",
  "/auth/resend-code",
  "/auth/logout",
  "/auth/session/",
  "/api/auth/refresh",
  "/api/auth/request-code",
  "/api/auth/verify-code",
  "/api/auth/resend-code",
  "/api/auth/logout",
  "/api/auth/session/",
];

let refreshPromise: Promise<boolean> | null = null;

export function shouldAttemptSessionRefresh(path: string): boolean {
  return !AUTH_PATHS_WITHOUT_REFRESH.some((blockedPath) =>
    path.startsWith(blockedPath),
  );
}

async function refreshViaBff(): Promise<boolean> {
  const response = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  return response.ok;
}

async function refreshViaDirectBackend(): Promise<boolean> {
  const refreshToken = clientSession.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildBackendApiUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as GlobalResponse<RefreshTokenData>;
  clientSession.setTokens(payload.data);

  try {
    await fetch("/auth/session/tokens", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: payload.data.access_token,
        refresh_token: payload.data.refresh_token,
        access_expires_at: payload.data.access_expires_at,
        refresh_expires_at: payload.data.refresh_expires_at,
      }),
    });
  } catch {
    // Cookie sync is best-effort; sessionStorage tokens are already updated.
  }

  return true;
}

async function performClientSessionRefresh(): Promise<boolean> {
  try {
    if (env.USE_DIRECT_BACKEND_API) {
      // Prefer the refresh token in sessionStorage; if it's missing (e.g. the
      // tab was reopened), fall back to the httpOnly refresh cookie.
      if (clientSession.getRefreshToken() && (await refreshViaDirectBackend())) {
        return true;
      }

      return (await syncSessionFromCookies()) === "ok";
    }

    return refreshViaBff();
  } catch {
    return false;
  }
}

export function refreshClientSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performClientSessionRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
