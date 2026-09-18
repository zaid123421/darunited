import { getSessionCookies } from "@/shared/lib/cookies";
import { getOtpDebugRequestHeaders } from "@/shared/lib/auth/otp-debug";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import type { RecoveryPrimaryEmailRequestData } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { newEmail?: string };
    const newEmail = body.newEmail?.trim().toLowerCase();

    if (!newEmail) {
      return jsonResponse(
        {
          status_code: 422,
          message: "New email is required.",
          data: null,
        },
        422,
      );
    }

    const { recoveryAccessToken } = await getSessionCookies();

    if (!recoveryAccessToken) {
      return jsonResponse(
        {
          status_code: 401,
          message: "Recovery session expired. Please start again.",
          data: null,
        },
        401,
      );
    }

    const { data, status } =
      await proxyToBackend<RecoveryPrimaryEmailRequestData>(
        "/auth/recovery/primary-email/request-code",
        {
          method: "POST",
          body: { newEmail },
          authToken: recoveryAccessToken,
          headers: getOtpDebugRequestHeaders(),
        },
      );

    return jsonResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}
