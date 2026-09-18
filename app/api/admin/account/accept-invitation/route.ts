import { resolveTurnstileToken } from "@/shared/lib/auth/otp-debug";
import {
  errorResponse,
  jsonResponse,
  proxyToBackend,
} from "@/shared/lib/api/proxy";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      invitationToken?: string;
      turnstileToken?: string;
    };
    const invitationToken = body.invitationToken?.trim();
    const turnstileToken = resolveTurnstileToken(body.turnstileToken);

    if (!invitationToken) {
      return jsonResponse(
        {
          status_code: 422,
          message: "Invitation token is required.",
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

    const { data, status } = await proxyToBackend<null>(
      "/admin/account/accept-invitation",
      {
        method: "POST",
        body: {
          invitationToken,
          turnstileToken,
        },
      },
    );

    return jsonResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}
