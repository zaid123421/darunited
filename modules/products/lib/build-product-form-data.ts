import type { MediaItem } from "@/modules/media/types";

type BuildProductFormDataInput = {
  title: string;
  description: string;
  subCategoryIds: number[];
  media: MediaItem[];
  mainIndex: number;
};

export function buildProductFormData({
  title,
  description,
  subCategoryIds,
  media,
  mainIndex,
}: BuildProductFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("description", description.trim());

  subCategoryIds.forEach((id) => {
    formData.append("subCategoryIds[]", String(id));
  });

  media.forEach((item, index) => {
    if (!item.file) {
      return;
    }

    if (item.kind === "video") {
      formData.append("videos[]", item.file);
      return;
    }

    if (index === mainIndex) {
      formData.append("mainPic", item.file);
      return;
    }

    formData.append("images[]", item.file);
  });

  return formData;
}
