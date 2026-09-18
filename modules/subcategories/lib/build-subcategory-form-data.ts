type BuildSubcategoryFormDataInput = {
  title: string;
  description?: string;
  categoryId: number;
  mainPicFile: File;
};

export function buildSubcategoryFormData({
  title,
  description,
  categoryId,
  mainPicFile,
}: BuildSubcategoryFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("category_id", String(categoryId));

  if (description?.trim()) {
    formData.append("description", description.trim());
  }

  formData.append("mainPic", mainPicFile);

  return formData;
}
