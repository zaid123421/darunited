import type { MediaItem } from "@/modules/media/types";

type BuildAboutFormDataInput = {
  title: string;
  script: string;
  media: MediaItem[];
};

export function buildAboutFormData({
  title,
  script,
  media,
}: BuildAboutFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("script", script.trim());

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
