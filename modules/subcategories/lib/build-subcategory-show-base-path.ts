export function buildSubcategoryShowBasePath(
  subcategoryId: number | string,
  options: { mediaPage?: number } = {},
) {
  const params = new URLSearchParams();

  if (options.mediaPage && options.mediaPage > 1) {
    params.set("page", String(options.mediaPage));
  }

  const query = params.toString();

  return query
    ? `/dashboard/subcategories/${subcategoryId}?${query}`
    : `/dashboard/subcategories/${subcategoryId}`;
}
