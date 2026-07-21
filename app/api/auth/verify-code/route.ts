import {
  getSessionCookies,
  setSessionCookies,
} from "@/shared/lib/cookies";
import { sanitizeVerifyCodeResponse } from "@/shared/lib/auth/otp-session";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import { otpSchema } from "@/modules/auth/schemas/otp.schema";
import type { VerifyCodeData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const parsed = otpSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        {
          status_code: 422,
          message: parsed.error.issues[0]?.message ?? "Invalid verification code.",
          data: null,
        },
        422,
      );
    }

    const { otpAccessToken } = await getSessionCookies();

    if (!otpAccessToken) {
      return jsonResponse(
        {
          status_code: 401,
          message: "OTP session expired. Please login again.",
          data: null,
        },
        401,
      );
    }

    const { data } = await proxyToBackend<VerifyCodeData>("/auth/verify-code", {
      method: "POST",
      body: { code: parsed.data.code },
      authToken: otpAccessToken,
    });

    await setSessionCookies({
      accessToken: data.data.tokens.access_token,
      refreshToken: data.data.tokens.refresh_token,
      accessExpiresAt: data.data.tokens.access_expires_at,
      refreshExpiresAt: data.data.tokens.refresh_expires_at,
      role: data.data.user.role,
    });

    return jsonResponse(sanitizeVerifyCodeResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
