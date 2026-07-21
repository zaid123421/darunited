import { setOtpAccessCookie } from "@/shared/lib/cookies";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      expires_at?: string;
    };

    if (!body.token || !body.expires_at) {
      return jsonResponse(
        {
          status_code: 422,
          message: "OTP token and expiry are required.",
          data: null,
        },
        422,
      );
    }

    await setOtpAccessCookie(body.token, body.expires_at);

    return jsonResponse({
      status_code: 200,
      message: "OTP session synced.",
      data: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
