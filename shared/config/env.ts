function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

const DEFAULT_BACKEND_API_URL = "http://127.0.0.1:8000/api";

const backendApiUrl = trimTrailingSlash(
  process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL,
);

const publicBackendApiUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
    process.env.BACKEND_API_URL ??
    DEFAULT_BACKEND_API_URL,
);

export const env = {
  BACKEND_API_URL: backendApiUrl,
  PUBLIC_BACKEND_API_URL: publicBackendApiUrl,
  USE_DIRECT_BACKEND_API:
    process.env.NEXT_PUBLIC_USE_DIRECT_BACKEND_API === "true",
  EXPOSE_OTP_DEBUG:
    process.env.EXPOSE_OTP_DEBUG === "true" ||
    process.env.NEXT_PUBLIC_EXPOSE_OTP_DEBUG === "true",
  /** Skip OTP and enter dashboard as super_admin until backend exists. Disable when API is ready. */
  DEV_AUTH_BYPASS:
    process.env.DEV_AUTH_BYPASS === "true" ||
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true",
  COOKIE_NAMES: {
    OTP_ACCESS: "du_otp_access_token",
    ACCESS: "du_access_token",
    REFRESH: "du_refresh_token",
    ROLE: "du_user_role",
  },
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

export function buildBackendApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.PUBLIC_BACKEND_API_URL}${normalizedPath}`;
}
