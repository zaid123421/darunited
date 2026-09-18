import { proxyWithSessionAuth, errorResponse, jsonResponse } from "@/shared/lib/api/proxy";
import type { MeUser } from "@/modules/auth/types";

export async function GET() {
  try {
    const { data, status } = await proxyWithSessionAuth<MeUser>("/auth/me", {
      method: "GET",
    });

    return jsonResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}
