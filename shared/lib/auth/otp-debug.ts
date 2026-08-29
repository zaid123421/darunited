import { env } from "@/shared/config/env";

export type RequestCodePayload = {
  email: string;
  turnstileToken: string;
  companyWebsite?: string | null;
};

export function getOtpDebugRequestHeaders(): Record<string, string> {
  if (!env.EXPOSE_OTP_DEBUG) {
    return {};
  }

  return {
    "X-Otp-Debug": "true",
    "X-Debug": "true",
  };
}

export function resolveTurnstileToken(token?: string | null) {
  const trimmed = token?.trim();
  if (trimmed) {
    return trimmed;
  }

  return env.TURNSTILE_TEST_TOKEN.trim();
}

export function buildRequestCodeBody(payload: RequestCodePayload) {
  return {
    email: payload.email.trim().toLowerCase(),
    turnstileToken: resolveTurnstileToken(payload.turnstileToken),
    companyWebsite: payload.companyWebsite ?? null,
  };
}

export function buildResendCodeBody() {
  return {};
}
