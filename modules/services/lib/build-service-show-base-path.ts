export function buildServiceShowBasePath(
  serviceId: number | string,
  options: { mediaPage?: number; projectsPage?: number } = {},
) {
  const params = new URLSearchParams();

  if (options.mediaPage && options.mediaPage > 1) {
    params.set("page", String(options.mediaPage));
  }

  if (options.projectsPage && options.projectsPage > 1) {
    params.set("projects_page", String(options.projectsPage));
  }

  const query = params.toString();

  return query
    ? `/dashboard/services/${serviceId}?${query}`
    : `/dashboard/services/${serviceId}`;
}
