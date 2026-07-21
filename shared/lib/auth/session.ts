import {
  clearSessionCookies,
  getSessionCookies,
  setSessionCookies,
} from "@/shared/lib/cookies";
import { proxyToBackend } from "@/shared/lib/api/proxy";
import type { RefreshTokenData } from "@/modules/auth/types";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

export async function performTokenRefresh(): Promise<
  GlobalResponse<RefreshTokenData>
> {
  const { refreshToken } = await getSessionCookies();

  if (!refreshToken) {
    throw new ApiError("No refresh token available", 401);
  }

  const { data } = await proxyToBackend<RefreshTokenData>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });

  await setSessionCookies({
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
    accessExpiresAt: data.data.access_expires_at,
    refreshExpiresAt: data.data.refresh_expires_at,
  });

  return data;
}

export async function performLogout(): Promise<GlobalResponse<null>> {
  const { accessToken, refreshToken } = await getSessionCookies();

  if (accessToken) {
    const { data } = await proxyToBackend<null>("/auth/logout", {
      method: "POST",
      body: refreshToken ? { refresh_token: refreshToken } : {},
      authToken: accessToken,
    });

    await clearSessionCookies();
    return data;
  }

  await clearSessionCookies();

  return {
    status_code: 200,
    message: "Logged out successfully",
    data: null,
  };
}
