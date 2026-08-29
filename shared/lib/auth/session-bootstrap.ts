import { env } from "@/shared/config/env";
import { clientSession } from "@/shared/lib/auth/client-session";
import type { RefreshTokenData } from "@/modules/auth/types";
import type { GlobalResponse } from "@/shared/types/global-response";

export type BootstrapResult = "ok" | "unauthenticated" | "error";

export function hasClientSessionTokens() {
  return Boolean(
    clientSession.getAccessToken() && clientSession.getRefreshToken(),
  );
}

export async function syncSessionFromCookies(): Promise<BootstrapResult> {
  let response: Response;

  try {
    response = await fetch("/auth/session/bootstrap", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  } catch {
    // Network failure: don't force a logout, let later requests decide.
    return "error";
  }

  if (response.status === 401) {
    return "unauthenticated";
  }

  if (!response.ok) {
    return "error";
  }

  // Only the direct-backend client keeps tokens in sessionStorage. In BFF mode
  // the response carries no tokens and cookies remain the single source.
  if (env.USE_DIRECT_BACKEND_API) {
    try {
      const payload = (await response.json()) as GlobalResponse<RefreshTokenData>;

      if (payload.data?.access_token && payload.data?.refresh_token) {
        clientSession.setTokens(payload.data);
      }
    } catch {
      return "error";
    }
  }

  return "ok";
}

export async function bootstrapClientSession(): Promise<BootstrapResult> {
  if (env.USE_DIRECT_BACKEND_API && hasClientSessionTokens()) {
    return "ok";
  }

  return syncSessionFromCookies();
}
