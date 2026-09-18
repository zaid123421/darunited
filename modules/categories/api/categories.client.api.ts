import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateCategoryInput } from "@/modules/categories/types";

function hasInfoChanges(input: UpdateCategoryInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription =
    input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription
  );
}

function buildEditFormData(input: UpdateCategoryInput) {
  const formData = new FormData();

  if (hasInfoChanges(input)) {
    formData.append("title", input.title.trim());
    formData.append("description", input.description?.trim() || "");
  }

  if (input.mainPicAction === "upload" && input.mainPicFile) {
    formData.append("main_pic", input.mainPicFile);
  }

  return formData;
}

export const categoriesClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/categories/add-category", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/categories/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  updateWithMedia: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/categories/edit/${id}`, formData, {
      method: "PUT",
    }),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    }),

  updateCategory: async (input: UpdateCategoryInput) => {
    const infoChanged = hasInfoChanges(input);
    const replacingMainPic =
      input.mainPicAction === "upload" && Boolean(input.mainPicFile);

    if (!infoChanged && !replacingMainPic) {
      return;
    }

    if (replacingMainPic) {
      await categoriesClientApi.updateWithMedia(
        input.id,
        buildEditFormData(input),
      );
      return;
    }

    await categoriesClientApi.update(input.id, {
      title: input.title.trim(),
      description: input.description?.trim() || null,
    });
  },
};
