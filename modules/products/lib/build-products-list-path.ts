export function buildProductShowBasePath(id: number | string) {
  return `/dashboard/products/${id}`;
}

const PRODUCT_FILTER_KEYS = [
  "title",
  "description",
  "categoryIds",
  "subCategoryIds",
] as const;

export function hasActiveProductFilters(
  params: Record<string, string | undefined>,
) {
  return PRODUCT_FILTER_KEYS.some((key) => Boolean(params[key]?.trim()));
}

export function buildProductsListBasePath(
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  PRODUCT_FILTER_KEYS.forEach((key) => {
    const value = params[key]?.trim();
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildProductsListQuery(
  params: Record<string, string | undefined>,
  page: number,
) {
  const search = new URLSearchParams();

  if (page > 1) {
    search.set("page", String(page));
  }

  PRODUCT_FILTER_KEYS.forEach((key) => {
    const value = params[key]?.trim();
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}
