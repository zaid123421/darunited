import type { MediaItem } from "@/modules/media/types";

type BuildSubcategoryFormDataInput = {
  title: string;
  description?: string;
  categoryId: number;
  media: MediaItem[];
  mainIndex: number;
};

export function buildSubcategoryFormData({
  title,
  description,
  categoryId,
  media,
  mainIndex,
}: BuildSubcategoryFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("categoryId", String(categoryId));

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
