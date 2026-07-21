import { setSessionCookies } from "@/shared/lib/cookies";
import { createDevJwt } from "@/shared/lib/auth/dev-jwt";
import type { AuthUser, AuthTokens, DevBypassLoginData } from "@/modules/auth/types";

export async function performDevBypassLogin(
  email: string,
): Promise<DevBypassLoginData> {
  const normalizedEmail = email.trim().toLowerCase();
  const ttlSeconds = 60 * 60 * 24 * 30;
  const accessToken = createDevJwt(
    { sub: normalizedEmail, role: "super_admin", typ: "access" },
    ttlSeconds,
  );
  const refreshToken = createDevJwt(
    { sub: normalizedEmail, role: "super_admin", typ: "refresh" },
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
    user_name: normalizedEmail.split("@")[0] || "Dev Admin",
    role: "super_admin",
    status: "active",
    pic: null,
    email_credential: { email: normalizedEmail },
  };

  await setSessionCookies({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessExpiresAt: tokens.access_expires_at,
    refreshExpiresAt: tokens.refresh_expires_at,
    role: "super_admin",
  });

  return {
    bypass: true,
    user,
    tokens,
  };
}
