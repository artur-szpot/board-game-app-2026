export interface Pagination {
  pageSize: number;
  pageNumber: number;
  // TODO: remove this from here or hide it from user-facing DTOs
  offset?: number;
}

export const DEFAULT_PAGINATION: Pagination = {
  pageSize: 10,
  pageNumber: 0,
};
