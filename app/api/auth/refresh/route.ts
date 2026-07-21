import {
  errorResponse,
  jsonResponse,
} from "@/shared/lib/api/proxy";
import {
  performTokenRefresh,
} from "@/shared/lib/auth/session";
import { sanitizeRefreshResponse } from "@/shared/lib/auth/otp-session";

export async function POST() {
  try {
    const data = await performTokenRefresh();
    return jsonResponse(sanitizeRefreshResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
