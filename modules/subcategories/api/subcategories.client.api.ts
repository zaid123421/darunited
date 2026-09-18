import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateSubcategoryInput } from "@/modules/subcategories/types";

function hasInfoChanges(input: UpdateSubcategoryInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription =
    input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription ||
    input.categoryId !== input.initialCategoryId
  );
}

function buildEditFormData(input: UpdateSubcategoryInput) {
  const formData = new FormData();

  if (hasInfoChanges(input)) {
    formData.append("title", input.title.trim());
    formData.append("description", input.description?.trim() || "");
    formData.append("category_id", String(input.categoryId));
  }

  if (input.mainPicAction === "upload" && input.mainPicFile) {
    formData.append("mainPic", input.mainPicFile);
  }

  return formData;
}

export const subcategoriesClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/subcategories/add-subcategory", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/subcategories/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  updateWithMedia: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/subcategories/edit/${id}`, formData, {
      method: "PUT",
    }),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/subcategories/${id}`, {
      method: "DELETE",
    }),

  updateSubcategory: async (input: UpdateSubcategoryInput) => {
    const infoChanged = hasInfoChanges(input);
    const replacingMainPic =
      input.mainPicAction === "upload" && Boolean(input.mainPicFile);

    if (!infoChanged && !replacingMainPic) {
      return;
    }

    if (replacingMainPic) {
      await subcategoriesClientApi.updateWithMedia(
        input.id,
        buildEditFormData(input),
      );
      return;
    }

    await subcategoriesClientApi.update(input.id, {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category_id: input.categoryId,
    });
  },
};
