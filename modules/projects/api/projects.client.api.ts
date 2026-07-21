import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import { buildSyncGalleryFormData } from "@/modules/services/lib/build-sync-gallery-form-data";
import type { UpdateProjectInput } from "@/modules/projects/types";

function buildMainPicFormData(file: File) {
  const formData = new FormData();
  formData.append("pic", file);
  return formData;
}

function hasInfoChanges(input: UpdateProjectInput) {
  return (
    input.title.trim() !== input.initialTitle.trim() ||
    input.clientName.trim() !== input.initialClientName.trim() ||
    input.clientRegion.trim() !== input.initialClientRegion.trim() ||
    input.actualProjectDate.trim() !== input.initialActualProjectDate.trim() ||
    input.description.trim() !== input.initialDescription.trim() ||
    input.status !== input.initialStatus ||
    input.serviceId !== input.initialServiceId
  );
}

export const projectsClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/projects/add-project", formData),

  update: (id: number | string, body: Record<string, unknown>) =>
    clientFetch<null>(`/api/admin/projects/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMainPic: (id: number | string) =>
    clientFetch<null>(`/api/admin/projects/delete-main-pic/${id}`, {
      method: "DELETE",
    }),

  uploadMainPic: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/projects/upload-main-pic/${id}`, formData),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/projects/sync-gallery/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/projects/${id}`, {
      method: "DELETE",
    }),

  updateProject: async (input: UpdateProjectInput) => {
    if (hasInfoChanges(input)) {
      await projectsClientApi.update(input.id, {
        title: input.title.trim(),
        clientName: input.clientName.trim(),
        clientRegion: input.clientRegion.trim(),
        actualProjectDate: input.actualProjectDate.trim(),
        description: input.description.trim(),
        status: input.status,
        serviceId: String(input.serviceId),
      });
    }

    if (input.mainPicAction === "delete") {
      await projectsClientApi.deleteMainPic(input.id);
    } else if (input.mainPicAction === "upload" && input.mainPicFile) {
      await projectsClientApi.uploadMainPic(
        input.id,
        buildMainPicFormData(input.mainPicFile),
      );
    }

    if (input.galleryChanged) {
      await projectsClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
