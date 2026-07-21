import { setOtpAccessCookie } from "@/shared/lib/cookies";
import {
  buildRequestCodeBody,
  getOtpDebugRequestHeaders,
} from "@/shared/lib/auth/otp-debug";
import { performDevBypassLogin } from "@/shared/lib/auth/dev-bypass-login";
import { sanitizeRequestCodeResponse } from "@/shared/lib/auth/otp-session";
import { env } from "@/shared/config/env";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import type { RequestCodeData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

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

    // No Laravel yet — same path as /api/auth/dev-bypass so Netlify never hits 127.0.0.1.
    if (env.DEV_AUTH_BYPASS) {
      const data = await performDevBypassLogin(email);

      return jsonResponse({
        status_code: 200,
        message:
          "Dev bypass login — remove DEV_AUTH_BYPASS when the API is ready.",
        data,
      });
    }

    const { data } = await proxyToBackend<RequestCodeData>(
      "/auth/request-code",
      {
        method: "POST",
        body: buildRequestCodeBody(email),
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
