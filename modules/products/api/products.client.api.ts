import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateProductInput } from "@/modules/products/types";
import { buildSyncGalleryFormData } from "@/modules/media/lib/build-sync-gallery-form-data";

function buildMainPicFormData(file: File) {
  const formData = new FormData();
  formData.append("pic", file);
  return formData;
}

function hasInfoChanges(input: UpdateProductInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription = input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription
  );
}

export const productsClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/products/add-product", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/products/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMainPic: (id: number | string) =>
    clientFetch<null>(`/api/admin/products/delete-main-pic/${id}`, {
      method: "DELETE",
    }),

  uploadMainPic: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/products/upload-main-pic/${id}`, formData),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/products/sync-gallery/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/products/${id}`, {
      method: "DELETE",
    }),

  updateProduct: async (input: UpdateProductInput) => {
    if (hasInfoChanges(input)) {
      await productsClientApi.update(input.id, {
        title: input.title.trim(),
        description: input.description?.trim() || null,
      });
    }

    if (input.mainPicAction === "delete") {
      await productsClientApi.deleteMainPic(input.id);
    } else if (input.mainPicAction === "upload" && input.mainPicFile) {
      await productsClientApi.uploadMainPic(
        input.id,
        buildMainPicFormData(input.mainPicFile),
      );
    }

    if (input.galleryChanged) {
      await productsClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
