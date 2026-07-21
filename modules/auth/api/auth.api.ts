import { clientFetch } from "@/shared/lib/api/client";
import { ensureFcmTokenRegistered } from "@/modules/notifications/lib/fcm-token";
import { logNotificationDebug } from "@/modules/notifications/lib/notification-debug";
import { clientSession } from "@/shared/lib/auth/client-session";
import { unregisterFcmToken } from "@/modules/notifications/lib/fcm-token";
import {
  buildRequestCodeBody,
  buildResendCodeBody,
} from "@/shared/lib/auth/otp-debug";
import { sanitizeRefreshResponse } from "@/shared/lib/auth/otp-session";
import { syncSessionFromCookies } from "@/shared/lib/auth/session-bootstrap";
import { env } from "@/shared/config/env";
import type {
  DevBypassLoginData,
  RefreshTokenData,
  RefreshTokenPublicData,
  RequestCodePublicData,
  VerifyCodePublicData,
} from "@/modules/auth/types";
import { toStoredAuthUser } from "@/shared/lib/auth/user";
import { ApiError } from "@/shared/types/global-response";

async function syncSessionCookies(tokens: {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
}) {
  await clientFetch("/api/auth/session/tokens", {
    method: "POST",
    body: JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_expires_at: tokens.access_expires_at,
      refresh_expires_at: tokens.refresh_expires_at,
    }),
  });
}

async function clearSyncedSession() {
  clientSession.clear();

  try {
    await clientFetch("/api/auth/session/tokens", {
      method: "DELETE",
    });
  } catch {
    // Best-effort cookie cleanup.
  }
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export const authApi = {
  requestCode: async (email: string) => {
    if (env.DEV_AUTH_BYPASS) {
      const response = await clientFetch<DevBypassLoginData>(
        "/api/auth/dev-bypass",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );

      clientSession.setUser(toStoredAuthUser(response.data.user));
      clientSession.setTokens({
        access_token: response.data.tokens.access_token,
        refresh_token: response.data.tokens.refresh_token,
      });

      return response;
    }

    return clientFetch<RequestCodePublicData>("/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify(buildRequestCodeBody(email)),
    });
  },

  verifyCode: async (code: string) => {
    const response = await clientFetch<VerifyCodePublicData>(
      "/api/auth/verify-code",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    );

    clientSession.setUser(toStoredAuthUser(response.data.user));

    if (env.USE_DIRECT_BACKEND_API) {
      await syncSessionFromCookies();
    }

    void ensureFcmTokenRegistered().then((result) => {
      if (!result.ok) {
        logNotificationDebug("FCM registration deferred after login", {
          reason: result.reason,
        });
      }
    });

    return response;
  },

  resendCode: async () => {
    return clientFetch<RequestCodePublicData>("/api/auth/resend-code", {
      method: "POST",
      body: JSON.stringify(buildResendCodeBody()),
    });
  },

  logout: async () => {
    await unregisterFcmToken();

    if (!env.USE_DIRECT_BACKEND_API) {
      const response = await clientFetch<null>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });

      clientSession.clear();

      return response;
    }

    const accessToken = clientSession.getAccessToken();
    const refreshToken = clientSession.getRefreshToken();

    if (accessToken) {
      try {
        await clientFetch<null>("/auth/logout", {
          method: "POST",
          body: JSON.stringify(
            refreshToken ? { refresh_token: refreshToken } : {},
          ),
          headers: authHeaders(accessToken),
        });
      } catch {
        // Continue clearing local session even if backend logout fails.
      }
    }

    await clearSyncedSession();

    return {
      status_code: 200,
      message: "Logged out successfully",
      data: null,
    };
  },

  refresh: async () => {
    if (!env.USE_DIRECT_BACKEND_API) {
      return clientFetch<RefreshTokenPublicData>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({}),
      });
    }

    const refreshToken = clientSession.getRefreshToken();

    if (!refreshToken) {
      throw new ApiError("No refresh token available", 401);
    }

    const response = await clientFetch<RefreshTokenData>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    clientSession.setTokens(response.data);
    await syncSessionCookies(response.data);

    return sanitizeRefreshResponse(response);
  },
};
