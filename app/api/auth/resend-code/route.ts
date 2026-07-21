import {
  getSessionCookies,
  setOtpAccessCookie,
} from "@/shared/lib/cookies";
import {
  buildResendCodeBody,
  getOtpDebugRequestHeaders,
} from "@/shared/lib/auth/otp-debug";
import { sanitizeRequestCodeResponse } from "@/shared/lib/auth/otp-session";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import type { RequestCodeData } from "@/modules/auth/types";

export async function POST() {
  try {
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

    const { data } = await proxyToBackend<RequestCodeData>(
      "/auth/resend-code",
      {
        method: "POST",
        body: buildResendCodeBody(),
        authToken: otpAccessToken,
        headers: getOtpDebugRequestHeaders(),
      },
    );

    await setOtpAccessCookie(
      data.data.otp_access_token,
      data.data.expires_at,
    );

    return jsonResponse(sanitizeRequestCodeResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
