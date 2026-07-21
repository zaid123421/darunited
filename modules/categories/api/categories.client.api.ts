import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateCategoryInput } from "@/modules/categories/types";
import { buildSyncGalleryFormData } from "@/modules/media/lib/build-sync-gallery-form-data";

function buildMainPicFormData(file: File) {
  const formData = new FormData();
  formData.append("pic", file);
  return formData;
}

function hasInfoChanges(input: UpdateCategoryInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription = input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription
  );
}

export const categoriesClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/categories/add-category", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/categories/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMainPic: (id: number | string) =>
    clientFetch<null>(`/api/admin/categories/delete-main-pic/${id}`, {
      method: "DELETE",
    }),

  uploadMainPic: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/categories/upload-main-pic/${id}`, formData),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/categories/sync-gallery/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    }),

  updateCategory: async (input: UpdateCategoryInput) => {
    if (hasInfoChanges(input)) {
      await categoriesClientApi.update(input.id, {
        title: input.title.trim(),
        description: input.description?.trim() || null,
      });
    }

    if (input.mainPicAction === "delete") {
      await categoriesClientApi.deleteMainPic(input.id);
    } else if (input.mainPicAction === "upload" && input.mainPicFile) {
      await categoriesClientApi.uploadMainPic(
        input.id,
        buildMainPicFormData(input.mainPicFile),
      );
    }

    if (input.galleryChanged) {
      await categoriesClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
