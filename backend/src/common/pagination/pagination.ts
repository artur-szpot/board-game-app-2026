export interface Pagination {
  pageSize: number;
  pageNumber: number;
}

export const DEFAULT_PAGINATION: Pagination = {
  pageSize: 10,
  pageNumber: 0,
};
