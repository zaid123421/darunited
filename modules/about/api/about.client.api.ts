import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import { buildSyncGalleryFormData } from "@/modules/media/lib/build-sync-gallery-form-data";
import type { UpdateAboutUsSectionInput } from "@/modules/about/types";

export const aboutClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/about-us/add-section", formData),

  update: (id: number | string, body: { title: string; script: string }) =>
    clientFetch<null>(`/api/admin/about-us/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/about-us/edit-media/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/about-us/${id}`, {
      method: "DELETE",
    }),

  updateSection: async (input: UpdateAboutUsSectionInput) => {
    const hasInfoChanges =
      input.title.trim() !== input.initialTitle.trim() ||
      input.script.trim() !== input.initialScript.trim();

    if (hasInfoChanges) {
      await aboutClientApi.update(input.id, {
        title: input.title.trim(),
        script: input.script.trim(),
      });
    }

    if (input.galleryChanged) {
      await aboutClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
