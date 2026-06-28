import { Pagination } from '@common/pagination/pagination';

export type GetManyItemsDto = {
  pagination?: Pagination;
  searchTerm?: string;
  filters?: Record<string, string>;
};
