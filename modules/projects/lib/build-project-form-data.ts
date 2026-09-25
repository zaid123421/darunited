import type { MediaItem } from "@/modules/media/types";

type BuildProjectFormDataInput = {
  title: string;
  description: string;
  mainPicFile?: File | null;
  galleryMedia: MediaItem[];
};

export function buildProjectFormData({
  title,
  description,
  mainPicFile,
  galleryMedia,
}: BuildProjectFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("description", description.trim());

  if (mainPicFile) {
    formData.append("mainPic", mainPicFile);
  }

  galleryMedia.forEach((item) => {
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
