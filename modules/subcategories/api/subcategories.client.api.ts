import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateSubcategoryInput } from "@/modules/subcategories/types";
import { buildSyncGalleryFormData } from "@/modules/media/lib/build-sync-gallery-form-data";

function buildMainPicFormData(file: File) {
  const formData = new FormData();
  formData.append("pic", file);
  return formData;
}

function hasInfoChanges(input: UpdateSubcategoryInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription = input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription ||
    input.categoryId !== input.initialCategoryId
  );
}

export const subcategoriesClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/subcategories/add-subcategory", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/subcategories/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMainPic: (id: number | string) =>
    clientFetch<null>(`/api/admin/subcategories/delete-main-pic/${id}`, {
      method: "DELETE",
    }),

  uploadMainPic: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/subcategories/upload-main-pic/${id}`, formData),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/subcategories/sync-gallery/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/subcategories/${id}`, {
      method: "DELETE",
    }),

  updateSubcategory: async (input: UpdateSubcategoryInput) => {
    if (hasInfoChanges(input)) {
      await subcategoriesClientApi.update(input.id, {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        categoryId: input.categoryId,
      });
    }

    if (input.mainPicAction === "delete") {
      await subcategoriesClientApi.deleteMainPic(input.id);
    } else if (input.mainPicAction === "upload" && input.mainPicFile) {
      await subcategoriesClientApi.uploadMainPic(
        input.id,
        buildMainPicFormData(input.mainPicFile),
      );
    }

    if (input.galleryChanged) {
      await subcategoriesClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
