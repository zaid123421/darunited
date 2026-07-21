export function buildProjectShowBasePath(id: number | string) {
  return `/dashboard/projects/${id}`;
}

export function hasActiveProjectFilters(params: Record<string, string | undefined>) {
  const filterKeys = [
    "title",
    "description",
    "clientName",
    "serviceId",
    "actualProjectDate",
    "fromDate",
    "toDate",
  ];

  return filterKeys.some((key) => Boolean(params[key]?.trim()));
}

export function buildProjectsListBasePath(
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  const filterKeys = [
    "title",
    "description",
    "clientName",
    "serviceId",
    "actualProjectDate",
    "fromDate",
    "toDate",
  ] as const;

  filterKeys.forEach((key) => {
    const value = params[key]?.trim();
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildProjectsListQuery(
  params: Record<string, string | undefined>,
  page: number,
) {
  const search = new URLSearchParams();

  if (page > 1) {
    search.set("page", String(page));
  }

  const filterKeys = [
    "title",
    "description",
    "clientName",
    "serviceId",
    "actualProjectDate",
    "fromDate",
    "toDate",
  ] as const;

  filterKeys.forEach((key) => {
    const value = params[key]?.trim();
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}
