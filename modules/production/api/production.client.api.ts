import { clientFetch, clientUpload } from "@/shared/lib/api/client";
import { buildSyncGalleryFormData } from "@/modules/media/lib/build-sync-gallery-form-data";
import type {
  ProductionFeaturePayload,
  UpdateProductionSectionInput,
} from "@/modules/production/types";

function sameFeatures(
  left: ProductionFeaturePayload[],
  right: ProductionFeaturePayload[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((feature, index) => {
    const other = right[index];
    if (!other) return false;

    return (
      (feature.id ?? null) === (other.id ?? null) &&
      feature.title.trim() === other.title.trim() &&
      feature.script.trim() === other.script.trim()
    );
  });
}

export const productionClientApi = {
  create: (formData: FormData) =>
    clientUpload<null>("/api/admin/production/add-section", formData),

  update: (
    id: number | string,
    body: {
      title: string;
      script: string;
      features: ProductionFeaturePayload[];
    },
  ) =>
    clientFetch<null>(`/api/admin/production/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  syncGallery: (id: number | string, formData: FormData) =>
    clientUpload<null>(`/api/admin/production/edit-media/${id}`, formData),

  delete: (id: number | string) =>
    clientFetch<null>(`/api/admin/production/${id}`, {
      method: "DELETE",
    }),

  updateSection: async (input: UpdateProductionSectionInput) => {
    const hasInfoChanges =
      input.title.trim() !== input.initialTitle.trim() ||
      input.script.trim() !== input.initialScript.trim() ||
      !sameFeatures(input.features, input.initialFeatures);

    if (hasInfoChanges) {
      await productionClientApi.update(input.id, {
        title: input.title.trim(),
        script: input.script.trim(),
        features: input.features.map((feature) => ({
          ...(feature.id != null ? { id: feature.id } : {}),
          title: feature.title.trim(),
          script: feature.script.trim(),
        })),
      });
    }

    if (input.galleryChanged) {
      await productionClientApi.syncGallery(
        input.id,
        buildSyncGalleryFormData(input.galleryItems),
      );
    }
  },
};
