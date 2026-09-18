import { setRecoveryOtpAccessCookie } from "@/shared/lib/cookies";
import {
  buildRequestCodeBody,
  getOtpDebugRequestHeaders,
  resolveTurnstileToken,
} from "@/shared/lib/auth/otp-debug";
import { sanitizeRecoveryRequestCodeResponse } from "@/shared/lib/auth/otp-session";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import type { RecoveryRequestCodeData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      turnstileToken?: string;
      companyWebsite?: string | null;
    };
    const email = body.email?.trim().toLowerCase();
    const turnstileToken = resolveTurnstileToken(body.turnstileToken);

    if (!email) {
      return jsonResponse(
        {
          status_code: 422,
          message: "Email is required.",
          data: null,
        },
        422,
      );
    }

    if (!turnstileToken) {
      return jsonResponse(
        {
          status_code: 422,
          message: "Human verification is required.",
          data: null,
        },
        422,
      );
    }

    const { data } = await proxyToBackend<RecoveryRequestCodeData>(
      "/auth/recovery/request-code",
      {
        method: "POST",
        body: buildRequestCodeBody({
          email,
          turnstileToken,
          companyWebsite: body.companyWebsite ?? null,
        }),
        headers: getOtpDebugRequestHeaders(),
      },
    );

    await setRecoveryOtpAccessCookie(
      data.data.recovery_otp_access_token,
      data.data.expires_at,
    );

    return jsonResponse(sanitizeRecoveryRequestCodeResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
