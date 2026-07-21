import { parseBackendDateTime } from "@/shared/lib/auth/datetime";
import type {
  RefreshTokenData,
  RefreshTokenPublicData,
  RequestCodeData,
  RequestCodePublicData,
  VerifyCodeData,
  VerifyCodePublicData,
} from "@/modules/auth/types";
import type { GlobalResponse } from "@/shared/types/global-response";

const DEFAULT_OTP_MAX_AGE = 60 * 10;

export function getOtpCookieMaxAge(
  expiresAt: string,
  fallbackSeconds = DEFAULT_OTP_MAX_AGE,
): number {
  const expiresMs = parseBackendDateTime(expiresAt);

  if (Number.isNaN(expiresMs)) {
    return fallbackSeconds;
  }

  return Math.max(60, Math.floor((expiresMs - Date.now()) / 1000));
}

export function sanitizeRequestCodeResponse(
  response: GlobalResponse<RequestCodeData>,
): GlobalResponse<RequestCodePublicData> {
  const { otp_access_token: _otpAccessToken, ...publicData } = response.data;

  return {
    status_code: response.status_code,
    message: response.message,
    data: publicData,
  };
}

export function sanitizeVerifyCodeResponse(
  response: GlobalResponse<VerifyCodeData>,
): GlobalResponse<VerifyCodePublicData> {
  return {
    status_code: response.status_code,
    message: response.message,
    data: {
      user: response.data.user,
    },
  };
}

export function sanitizeRefreshResponse(
  response: GlobalResponse<RefreshTokenData>,
): GlobalResponse<RefreshTokenPublicData> {
  return {
    status_code: response.status_code,
    message: response.message,
    data: {
      access_expires_at: response.data.access_expires_at,
      refresh_expires_at: response.data.refresh_expires_at,
    },
  };
}
