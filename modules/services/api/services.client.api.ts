import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import type { UpdateServiceInput } from "@/modules/services/types";
import { buildSyncGalleryFormData } from "@/modules/services/lib/build-sync-gallery-form-data";

function buildMainPicFormData(file: File) {
  const formData = new FormData();
  formData.append("pic", file);
  return formData;
}

function hasInfoChanges(input: UpdateServiceInput) {
  const normalizedDescription = input.description?.trim() || undefined;
  const normalizedInitialDescription = input.initialDescription?.trim() || undefined;

  return (
    input.title.trim() !== input.initialTitle.trim() ||
    normalizedDescription !== normalizedInitialDescription
  );
}

export const servicesClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/services/add-service", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/services/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMainPic: (id: number | string) =>
    clientFetch<null>(`/api/admin/services/delete-main-pic/${id}`, {
      method: "DELETE",
    }),

  uploadMainPic: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/services/upload-main-pic/${id}`, formData),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/services/sync-gallery/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/services/${id}`, {
      method: "DELETE",
    }),

  updateService: async (input: UpdateServiceInput) => {
    if (hasInfoChanges(input)) {
      await servicesClientApi.update(input.id, {
        title: input.title.trim(),
        description: input.description?.trim() || null,
      });
    }

    if (input.mainPicAction === "delete") {
      await servicesClientApi.deleteMainPic(input.id);
    } else if (input.mainPicAction === "upload" && input.mainPicFile) {
      await servicesClientApi.uploadMainPic(
        input.id,
        buildMainPicFormData(input.mainPicFile),
      );
    }

    if (input.galleryChanged) {
      await servicesClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
