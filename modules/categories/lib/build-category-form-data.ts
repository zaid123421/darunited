type BuildCategoryFormDataInput = {
  title: string;
  description?: string;
  mainPicFile: File;
};

export function buildCategoryFormData({
  title,
  description,
  mainPicFile,
}: BuildCategoryFormDataInput): FormData {
  const formData = new FormData();

  formData.append("title", title.trim());

  if (description?.trim()) {
    formData.append("description", description.trim());
  }

  formData.append("mainPic", mainPicFile);

  return formData;
}
