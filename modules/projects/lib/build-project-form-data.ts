import type { MediaItem } from "@/modules/media/types";

type BuildProjectFormDataInput = {
  title: string;
  clientName: string;
  clientRegion: string;
  actualProjectDate: string;
  description: string;
  status: string;
  serviceId: number;
  mainPicFile?: File | null;
  galleryMedia: MediaItem[];
};

export function buildProjectFormData({
  title,
  clientName,
  clientRegion,
  actualProjectDate,
  description,
  status,
  serviceId,
  mainPicFile,
  galleryMedia,
}: BuildProjectFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("clientName", clientName.trim());
  formData.append("clientRegion", clientRegion.trim());
  formData.append("actualProjectDate", actualProjectDate.trim());
  formData.append("description", description.trim());
  formData.append("status", status);
  formData.append("serviceId", String(serviceId));

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
