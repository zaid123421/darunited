import type { MediaItem } from "@/modules/media/types";

type BuildCategoryFormDataInput = {
  title: string;
  description?: string;
  media: MediaItem[];
  mainIndex: number;
};

export function buildCategoryFormData({
  title,
  description,
  media,
  mainIndex,
}: BuildCategoryFormDataInput): FormData {
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
