import type { MediaItem } from "@/modules/media/types";
import type { ProductionFeaturePayload } from "@/modules/production/types";

type BuildProductionFormDataInput = {
  title: string;
  script: string;
  features: ProductionFeaturePayload[];
  media: MediaItem[];
};

export function buildProductionFormData({
  title,
  script,
  features,
  media,
}: BuildProductionFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("script", script.trim());

  features.forEach((feature, index) => {
    formData.append(`features[${index}][title]`, feature.title.trim());
    formData.append(`features[${index}][script]`, feature.script.trim());
  });

  media.forEach((item) => {
    if (!item.file) {
      return;
    }

    if (item.kind === "video") {
      formData.append("videos[]", item.file);
      return;
    }

    formData.append("images[]", item.file);
  });

  return formData;
}
