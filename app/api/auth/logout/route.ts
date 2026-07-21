import { clearSessionCookies } from "@/shared/lib/cookies";
import { errorResponse, jsonResponse } from "@/shared/lib/api/proxy";
import { performLogout } from "@/shared/lib/auth/session";

export async function POST() {
  try {
    const data = await performLogout();
    return jsonResponse(data);
  } catch (error) {
    await clearSessionCookies();
    return errorResponse(error);
  }
}
