import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";
import type { Subcategory } from "@/modules/subcategories/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const { data, status } = await proxyWithSessionAuth<Subcategory>(
      "/admin/subcategories/add-subcategory",
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
