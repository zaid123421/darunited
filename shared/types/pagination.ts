export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}
