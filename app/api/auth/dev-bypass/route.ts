import { performDevBypassLogin } from "@/shared/lib/auth/dev-bypass-login";
import { env } from "@/shared/config/env";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";

export async function POST(request: Request) {
  try {
    // Allowed in production while no backend exists — disable DEV_AUTH_BYPASS when API is ready.
    if (!env.DEV_AUTH_BYPASS) {
      return jsonResponse(
        {
          status_code: 403,
          message: "Dev auth bypass is disabled.",
          data: null,
        },
        403,
      );
    }

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

    const data = await performDevBypassLogin(email);

    return jsonResponse({
      status_code: 200,
      message: "Dev bypass login — remove DEV_AUTH_BYPASS when the API is ready.",
      data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
