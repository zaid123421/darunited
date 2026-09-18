import {
  getSessionCookies,
  setRecoveryAccessCookie,
} from "@/shared/lib/cookies";
import { sanitizeRecoveryVerifyCodeResponse } from "@/shared/lib/auth/otp-session";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import { otpSchema } from "@/modules/auth/schemas/otp.schema";
import type { RecoveryVerifyCodeData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const parsed = otpSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        {
          status_code: 422,
          message:
            parsed.error.issues[0]?.message ?? "Invalid verification code.",
          data: null,
        },
        422,
      );
    }

    const { recoveryOtpAccessToken } = await getSessionCookies();

    if (!recoveryOtpAccessToken) {
      return jsonResponse(
        {
          status_code: 401,
          message: "Recovery session expired. Please start again.",
          data: null,
        },
        401,
      );
    }

    const { data } = await proxyToBackend<RecoveryVerifyCodeData>(
      "/auth/recovery/verify-code",
      {
        method: "POST",
        body: { code: parsed.data.code },
        authToken: recoveryOtpAccessToken,
      },
    );

    await setRecoveryAccessCookie(
      data.data.recovery_access_token,
      data.data.expires_at,
    );

    return jsonResponse(sanitizeRecoveryVerifyCodeResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
