import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const { data, status } = await proxyWithSessionAuth<null>(
      "/admin/projects/add-project",
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
