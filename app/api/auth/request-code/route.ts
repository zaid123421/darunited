import { setOtpAccessCookie } from "@/shared/lib/cookies";
import {
  buildRequestCodeBody,
  getOtpDebugRequestHeaders,
} from "@/shared/lib/auth/otp-debug";
import { sanitizeRequestCodeResponse } from "@/shared/lib/auth/otp-session";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import type { RequestCodeData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string };
    const { data } = await proxyToBackend<RequestCodeData>(
      "/auth/request-code",
      {
        method: "POST",
        body: buildRequestCodeBody(body.email),
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
