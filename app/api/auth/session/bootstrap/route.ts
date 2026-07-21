import { clearSessionCookies, getSessionCookies } from "@/shared/lib/cookies";
import { isJwtExpired } from "@/shared/lib/auth/jwt";
import { performTokenRefresh } from "@/shared/lib/auth/session";
import { env } from "@/shared/config/env";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";
import { ApiError } from "@/shared/types/global-response";

export async function POST() {
  try {
    const { accessToken, refreshToken } = await getSessionCookies();

    let tokens =
      accessToken && refreshToken
        ? { access_token: accessToken, refresh_token: refreshToken }
        : null;

    if (!accessToken || isJwtExpired(accessToken)) {
      if (!refreshToken) {
        await clearSessionCookies();
        throw new ApiError("Unauthenticated.", 401);
      }

      try {
        const refreshed = await performTokenRefresh();
        tokens = {
          access_token: refreshed.data.access_token,
          refresh_token: refreshed.data.refresh_token,
        };
      } catch (refreshError) {
        await clearSessionCookies();

        if (refreshError instanceof ApiError) {
          throw new ApiError("Unauthenticated.", 401);
        }

        throw refreshError;
      }
    }

    // Only expose raw tokens to the client when it manages them directly
    // (sessionStorage). In BFF mode they must stay in httpOnly cookies.
    if (env.USE_DIRECT_BACKEND_API && tokens) {
      return jsonResponse({
        status_code: 200,
        message: "Session bootstrapped.",
        data: tokens,
      });
    }

    return jsonResponse({
      status_code: 200,
      message: "Session bootstrapped.",
      data: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
