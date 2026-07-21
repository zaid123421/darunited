import { setSessionCookies } from "@/shared/lib/cookies";
import { createDevJwt } from "@/shared/lib/auth/dev-jwt";
import { env } from "@/shared/config/env";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";
import type { AuthUser, AuthTokens } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    if (env.IS_PRODUCTION || !env.DEV_AUTH_BYPASS) {
      return jsonResponse(
        {
          status_code: 403,
          message: "Dev auth bypass is disabled.",
          data: null,
        },
        403,
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return jsonResponse(
        {
          status_code: 422,
          message: "Email is required.",
          data: null,
        },
        422,
      );
    }

    const ttlSeconds = 60 * 60 * 24 * 30;
    const accessToken = createDevJwt(
      { sub: email, role: "super_admin", typ: "access" },
      ttlSeconds,
    );
    const refreshToken = createDevJwt(
      { sub: email, role: "super_admin", typ: "refresh" },
      ttlSeconds,
    );
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const tokens: AuthTokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      access_expires_at: expiresAt,
      refresh_expires_at: expiresAt,
    };

    const user: AuthUser = {
      id: 1,
      user_name: email.split("@")[0] || "Dev Admin",
      role: "super_admin",
      status: "active",
      pic: null,
      email_credential: { email },
    };

    await setSessionCookies({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessExpiresAt: tokens.access_expires_at,
      refreshExpiresAt: tokens.refresh_expires_at,
      role: "super_admin",
    });

    return jsonResponse({
      status_code: 200,
      message: "Dev bypass login — remove DEV_AUTH_BYPASS when the API is ready.",
      data: {
        bypass: true as const,
        user,
        tokens,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
