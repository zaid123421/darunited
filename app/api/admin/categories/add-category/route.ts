import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";
import type { Category } from "@/modules/categories/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const { data, status } = await proxyWithSessionAuth<Category>(
      "/admin/categories/add-category",
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
