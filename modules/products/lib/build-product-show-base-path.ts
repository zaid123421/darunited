export function buildProductShowBasePath(
  productId: number | string,
  options: { mediaPage?: number } = {},
) {
  const params = new URLSearchParams();

  if (options.mediaPage && options.mediaPage > 1) {
    params.set("page", String(options.mediaPage));
  }

  const query = params.toString();

  return query
    ? `/dashboard/products/${productId}?${query}`
    : `/dashboard/products/${productId}`;
}
