import type { MediaItem } from "@/modules/media/types";

type BuildProductFormDataInput = {
  title: string;
  description?: string;
  media: MediaItem[];
  mainIndex: number;
};

export function buildProductFormData({
  title,
  description,
  media,
  mainIndex,
}: BuildProductFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());

  if (description?.trim()) {
    formData.append("description", description.trim());
  }

  media.forEach((item, index) => {
    if (!item.file) {
      return;
    }

    if (item.kind === "video") {
      formData.append("videos[]", item.file);
      return;
    }

    if (index === mainIndex) {
      formData.append("pic", item.file);
      return;
    }

    formData.append("images[]", item.file);
  });

  return formData;
}
