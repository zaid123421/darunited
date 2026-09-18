import {
  clearRecoveryCookies,
  getSessionCookies,
} from "@/shared/lib/cookies";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";
import { otpSchema } from "@/modules/auth/schemas/otp.schema";
import type { RecoveryPrimaryEmailVerifyData } from "@/modules/auth/types";

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
      await proxyToBackend<RecoveryPrimaryEmailVerifyData>(
        "/auth/recovery/primary-email/verify-code",
        {
          method: "POST",
          body: { code: parsed.data.code },
          authToken: recoveryAccessToken,
        },
      );

    await clearRecoveryCookies();

    return jsonResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}
