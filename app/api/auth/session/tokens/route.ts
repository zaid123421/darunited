import {
  clearSessionCookies,
  setSessionCookies,
} from "@/shared/lib/cookies";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      access_token?: string;
      refresh_token?: string;
      access_expires_at?: string;
      refresh_expires_at?: string;
    };

    if (!body.access_token || !body.refresh_token) {
      return jsonResponse(
        {
          status_code: 422,
          message: "Access and refresh tokens are required.",
          data: null,
        },
        422,
      );
    }

    await setSessionCookies({
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      accessExpiresAt: body.access_expires_at,
      refreshExpiresAt: body.refresh_expires_at,
    });

    return jsonResponse({
      status_code: 200,
      message: "Session synced.",
      data: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    await clearSessionCookies();

    return jsonResponse({
      status_code: 200,
      message: "Session cleared.",
      data: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
