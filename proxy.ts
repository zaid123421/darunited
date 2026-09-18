import { NextResponse, type NextRequest } from "next/server";
import type { RefreshTokenData } from "@/modules/auth/types";
import { buildServerBackendApiUrl, env } from "@/shared/config/env";
import { getJwtRemainingSeconds, isJwtExpired } from "@/shared/lib/auth/jwt";
import {
  canAccessDashboard,
  canWriteContent,
  isDashboardWritePath,
  normalizeRole,
  type UserRole,
} from "@/shared/lib/auth/roles";
import type { GlobalResponse } from "@/shared/types/global-response";

const AUTH_ROUTES = ["/login", "/otp"];
const RECOVERY_ROUTES = [
  "/recover",
  "/recover/otp",
  "/recover/new-email",
  "/recover/verify-new-email",
];
const DASHBOARD_PREFIX = "/dashboard";

type AuthCookieCleanup = {
  deleteExpiredAccess?: boolean;
  deleteExpiredRefresh?: boolean;
  deleteExpiredOtp?: boolean;
  deleteExpiredRecoveryOtp?: boolean;
  deleteExpiredRecoveryAccess?: boolean;
  deleteRefresh?: boolean;
  deleteOtp?: boolean;
  deleteRecovery?: boolean;
  deleteRole?: boolean;
};

function appendAuthCookieCleanup(
  response: NextResponse,
  cleanup: AuthCookieCleanup = {},
) {
  if (cleanup.deleteExpiredAccess) {
    response.cookies.delete(env.COOKIE_NAMES.ACCESS);
  }

  if (cleanup.deleteExpiredRefresh || cleanup.deleteRefresh) {
    response.cookies.delete(env.COOKIE_NAMES.REFRESH);
  }

  if (cleanup.deleteExpiredOtp || cleanup.deleteOtp) {
    response.cookies.delete(env.COOKIE_NAMES.OTP_ACCESS);
  }

  if (cleanup.deleteExpiredRecoveryOtp || cleanup.deleteRecovery) {
    response.cookies.delete(env.COOKIE_NAMES.RECOVERY_OTP_ACCESS);
  }

  if (cleanup.deleteExpiredRecoveryAccess || cleanup.deleteRecovery) {
    response.cookies.delete(env.COOKIE_NAMES.RECOVERY_ACCESS);
  }

  if (cleanup.deleteRole || cleanup.deleteRefresh) {
    response.cookies.delete(env.COOKIE_NAMES.ROLE);
  }

  return response;
}

function resolveSessionTokens(request: NextRequest) {
  const rawAccessToken = request.cookies.get(env.COOKIE_NAMES.ACCESS)?.value;
  const rawRefreshToken = request.cookies.get(env.COOKIE_NAMES.REFRESH)?.value;
  const rawOtpToken = request.cookies.get(env.COOKIE_NAMES.OTP_ACCESS)?.value;
  const rawRecoveryOtpToken = request.cookies.get(
    env.COOKIE_NAMES.RECOVERY_OTP_ACCESS,
  )?.value;
  const rawRecoveryAccessToken = request.cookies.get(
    env.COOKIE_NAMES.RECOVERY_ACCESS,
  )?.value;
  const role = normalizeRole(request.cookies.get(env.COOKIE_NAMES.ROLE)?.value);

  const accessExpired = Boolean(rawAccessToken && isJwtExpired(rawAccessToken));
  const refreshExpired = Boolean(rawRefreshToken && isJwtExpired(rawRefreshToken));
  const otpExpired = Boolean(rawOtpToken && isJwtExpired(rawOtpToken));
  const recoveryOtpExpired = Boolean(
    rawRecoveryOtpToken && isJwtExpired(rawRecoveryOtpToken),
  );
  const recoveryAccessExpired = Boolean(
    rawRecoveryAccessToken && isJwtExpired(rawRecoveryAccessToken),
  );

  return {
    accessToken: accessExpired ? undefined : rawAccessToken,
    refreshToken: refreshExpired ? undefined : rawRefreshToken,
    otpToken: otpExpired ? undefined : rawOtpToken,
    recoveryOtpToken: recoveryOtpExpired ? undefined : rawRecoveryOtpToken,
    recoveryAccessToken: recoveryAccessExpired
      ? undefined
      : rawRecoveryAccessToken,
    role,
    accessExpired,
    refreshExpired,
    otpExpired,
    recoveryOtpExpired,
    recoveryAccessExpired,
  };
}

function setTokenCookie(response: NextResponse, name: string, token: string) {
  const maxAge = getJwtRemainingSeconds(token);

  if (maxAge <= 0) {
    response.cookies.delete(name);
    return;
  }

  response.cookies.set(name, token, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function setRoleCookie(response: NextResponse, role: UserRole, maxAge: number) {
  if (maxAge <= 0) {
    response.cookies.delete(env.COOKIE_NAMES.ROLE);
    return;
  }

  response.cookies.set(env.COOKIE_NAMES.ROLE, role, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

async function refreshSessionForDashboard(
  refreshToken: string,
  existingRole: UserRole | null,
): Promise<NextResponse | null> {
  try {
    const refreshResponse = await fetch(buildServerBackendApiUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const payload =
      (await refreshResponse.json()) as GlobalResponse<RefreshTokenData>;
    const { access_token: nextAccessToken, refresh_token: nextRefreshToken } =
      payload.data;

    if (!nextAccessToken || !nextRefreshToken) {
      return null;
    }

    const response = NextResponse.next();
    setTokenCookie(response, env.COOKIE_NAMES.ACCESS, nextAccessToken);
    setTokenCookie(response, env.COOKIE_NAMES.REFRESH, nextRefreshToken);
    response.cookies.delete(env.COOKIE_NAMES.OTP_ACCESS);

    if (existingRole) {
      setRoleCookie(
        response,
        existingRole,
        getJwtRemainingSeconds(nextRefreshToken),
      );
    }

    return response;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const {
    accessToken,
    refreshToken,
    otpToken,
    recoveryOtpToken,
    recoveryAccessToken,
    role,
    accessExpired,
    refreshExpired,
    otpExpired,
    recoveryOtpExpired,
    recoveryAccessExpired,
  } = resolveSessionTokens(request);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isRecoveryRoute = RECOVERY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isActivateAccountRoute = pathname === "/activate-account";
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PREFIX);
  const isAuthenticated = Boolean(accessToken);

  const expiredCleanup: AuthCookieCleanup = {
    deleteExpiredAccess: accessExpired,
    deleteExpiredRefresh: refreshExpired,
    deleteExpiredOtp: otpExpired,
    deleteExpiredRecoveryOtp: recoveryOtpExpired,
    deleteExpiredRecoveryAccess: recoveryAccessExpired,
  };

  if (isDashboardRoute && !isAuthenticated) {
    if (refreshToken) {
      const refreshedResponse = await refreshSessionForDashboard(
        refreshToken,
        role,
      );

      if (refreshedResponse) {
        if (!canAccessDashboard(role)) {
          return appendAuthCookieCleanup(
            NextResponse.redirect(new URL("/", request.url)),
            {
              deleteExpiredOtp: otpExpired,
              deleteOtp: true,
            },
          );
        }

        if (!canWriteContent(role) && isDashboardWritePath(pathname)) {
          return appendAuthCookieCleanup(
            NextResponse.redirect(new URL("/dashboard", request.url)),
            {
              deleteExpiredOtp: otpExpired,
              deleteOtp: true,
            },
          );
        }

        return appendAuthCookieCleanup(refreshedResponse, {
          deleteExpiredOtp: otpExpired,
          deleteOtp: true,
        });
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return appendAuthCookieCleanup(NextResponse.redirect(loginUrl), {
      ...expiredCleanup,
      deleteRefresh: true,
      deleteOtp: true,
      deleteRole: true,
    });
  }

  if (isDashboardRoute && isAuthenticated) {
    if (!canAccessDashboard(role)) {
      return appendAuthCookieCleanup(
        NextResponse.redirect(new URL("/", request.url)),
        expiredCleanup,
      );
    }

    if (!canWriteContent(role) && isDashboardWritePath(pathname)) {
      return appendAuthCookieCleanup(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        expiredCleanup,
      );
    }
  }

  if (pathname === "/otp" && !otpToken && !isAuthenticated) {
    return appendAuthCookieCleanup(
      NextResponse.redirect(new URL("/login", request.url)),
      expiredCleanup,
    );
  }

  if (pathname === "/recover/otp" && !recoveryOtpToken) {
    return appendAuthCookieCleanup(
      NextResponse.redirect(new URL("/recover", request.url)),
      expiredCleanup,
    );
  }

  if (
    (pathname === "/recover/new-email" ||
      pathname === "/recover/verify-new-email") &&
    !recoveryAccessToken
  ) {
    return appendAuthCookieCleanup(
      NextResponse.redirect(new URL("/recover", request.url)),
      expiredCleanup,
    );
  }

  if (isAuthRoute && isAuthenticated) {
    const destination = canAccessDashboard(role) ? "/dashboard" : "/";
    return appendAuthCookieCleanup(
      NextResponse.redirect(new URL(destination, request.url)),
      expiredCleanup,
    );
  }

  if ((isRecoveryRoute || isActivateAccountRoute) && isAuthenticated) {
    // Allow recovery/activation while logged in only if needed; prefer dashboard.
    if (!isActivateAccountRoute) {
      return appendAuthCookieCleanup(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        expiredCleanup,
      );
    }
  }

  return appendAuthCookieCleanup(NextResponse.next(), expiredCleanup);
}

export const config = {
  matcher: [
    "/login",
    "/otp",
    "/recover",
    "/recover/:path*",
    "/activate-account",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
