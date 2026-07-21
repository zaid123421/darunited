import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";
import type { Service } from "@/modules/services/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const { data, status } = await proxyWithSessionAuth<Service>(
      "/admin/services/add-service",
      {
        method: "POST",
        body: formData,
        isFormData: true,
      },
    );

    return jsonResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}
