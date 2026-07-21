import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";
import type { Product } from "@/modules/products/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const { data, status } = await proxyWithSessionAuth<Product>(
      "/admin/products/add-product",
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
