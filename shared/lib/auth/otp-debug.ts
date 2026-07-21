import { env } from "@/shared/config/env";

export function getOtpDebugRequestHeaders(): Record<string, string> {
  if (!env.EXPOSE_OTP_DEBUG) {
    return {};
  }

  return {
    "X-Otp-Debug": "true",
    "X-Debug": "true",
  };
}

export function withOtpDebugBody<T extends Record<string, unknown>>(body: T): T {
  if (!env.EXPOSE_OTP_DEBUG) {
    return body;
  }

  return {
    ...body,
    debug: true,
  };
}

export function buildRequestCodeBody(email: string) {
  return withOtpDebugBody({ email });
}

export function buildResendCodeBody() {
  return withOtpDebugBody({});
}
