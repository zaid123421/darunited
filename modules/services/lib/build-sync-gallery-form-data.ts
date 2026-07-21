import type { MediaItem } from "@/modules/media/types";

export function buildSyncGalleryFormData(items: MediaItem[]): FormData {
  const formData = new FormData();
  const editedGalleries: Array<
    { id: number; order: number } | { temp_key: string; order: number }
  > = [];

  items.forEach((item, index) => {
    const order = index + 1;

    if (item.id) {
      editedGalleries.push({ id: item.id, order });
      return;
    }

    if (item.tempKey && item.file) {
      editedGalleries.push({ temp_key: item.tempKey, order });
      formData.append(`new_files[${item.tempKey}]`, item.file);
    }
  });

  formData.append("edited_galleries", JSON.stringify(editedGalleries));

  return formData;
}
