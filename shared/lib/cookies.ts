import { cookies } from "next/headers";
import { env } from "@/shared/config/env";
import { getOtpCookieMaxAge } from "@/shared/lib/auth/otp-session";
import {
  getJwtExp,
  getJwtRemainingSeconds,
  isJwtExpired,
} from "@/shared/lib/auth/jwt";
import {
  normalizeRole,
  type UserRole,
} from "@/shared/lib/auth/roles";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
}

function baseCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

function deleteExpiredTokenCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  name: string,
  token: string | undefined,
) {
  if (!token) {
    return undefined;
  }

  const jwtExp = getJwtExp(token);
  if (jwtExp !== null && jwtExp <= Math.floor(Date.now() / 1000)) {
    cookieStore.delete(name);
    return undefined;
  }

  return token;
}

function resolveOtpCookieMaxAge(token: string, expiresAt?: string): number {
  const jwtMaxAge = getJwtRemainingSeconds(token);

  if (jwtMaxAge > 0) {
    return jwtMaxAge;
  }

  const jwtExp = getJwtExp(token);
  if (jwtExp !== null && isJwtExpired(token)) {
    return 0;
  }

  if (expiresAt) {
    return getOtpCookieMaxAge(expiresAt);
  }

  return 0;
}

export async function getSessionCookies() {
  const cookieStore = await cookies();

  const otpAccessToken = deleteExpiredTokenCookie(
    cookieStore,
    env.COOKIE_NAMES.OTP_ACCESS,
    cookieStore.get(env.COOKIE_NAMES.OTP_ACCESS)?.value,
  );
  const accessToken = deleteExpiredTokenCookie(
    cookieStore,
    env.COOKIE_NAMES.ACCESS,
    cookieStore.get(env.COOKIE_NAMES.ACCESS)?.value,
  );
  const refreshToken = deleteExpiredTokenCookie(
    cookieStore,
    env.COOKIE_NAMES.REFRESH,
    cookieStore.get(env.COOKIE_NAMES.REFRESH)?.value,
  );
  const role = normalizeRole(cookieStore.get(env.COOKIE_NAMES.ROLE)?.value);

  return {
    otpAccessToken,
    accessToken,
    refreshToken,
    role,
  };
}

export async function setOtpAccessCookie(token: string, expiresAt?: string) {
  const cookieStore = await cookies();
  const maxAge = resolveOtpCookieMaxAge(token, expiresAt);

  if (maxAge <= 0) {
    cookieStore.delete(env.COOKIE_NAMES.OTP_ACCESS);
    return;
  }

  cookieStore.set(
    env.COOKIE_NAMES.OTP_ACCESS,
    token,
    baseCookieOptions(maxAge),
  );
}

export async function setSessionCookies(tokens: {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt?: string;
  refreshExpiresAt?: string;
  role?: string | UserRole | null;
}) {
  const cookieStore = await cookies();

  const accessMaxAge = getJwtRemainingSeconds(tokens.accessToken);
  const refreshMaxAge = getJwtRemainingSeconds(tokens.refreshToken);
  const roleMaxAge = Math.max(accessMaxAge, refreshMaxAge);
  const normalizedRole = normalizeRole(tokens.role ?? undefined);

  if (accessMaxAge > 0) {
    cookieStore.set(
      env.COOKIE_NAMES.ACCESS,
      tokens.accessToken,
      baseCookieOptions(accessMaxAge),
    );
  } else {
    cookieStore.delete(env.COOKIE_NAMES.ACCESS);
  }

  if (refreshMaxAge > 0) {
    cookieStore.set(
      env.COOKIE_NAMES.REFRESH,
      tokens.refreshToken,
      baseCookieOptions(refreshMaxAge),
    );
  } else {
    cookieStore.delete(env.COOKIE_NAMES.REFRESH);
  }

  if (normalizedRole && roleMaxAge > 0) {
    cookieStore.set(
      env.COOKIE_NAMES.ROLE,
      normalizedRole,
      baseCookieOptions(roleMaxAge),
    );
  } else if (!normalizedRole) {
    cookieStore.delete(env.COOKIE_NAMES.ROLE);
  }

  cookieStore.delete(env.COOKIE_NAMES.OTP_ACCESS);
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(env.COOKIE_NAMES.OTP_ACCESS);
  cookieStore.delete(env.COOKIE_NAMES.ACCESS);
  cookieStore.delete(env.COOKIE_NAMES.REFRESH);
  cookieStore.delete(env.COOKIE_NAMES.ROLE);
}
