import { Pagination } from '@common/pagination/pagination';

export type SortDirection = 'asc' | 'desc';

export type ItemOwnershipDto = {
  userId?: string;
  hasCollectionSuperuserPermission?: boolean;
};

export type GetManyItemsDto = ItemOwnershipDto & {
  pagination?: Pagination;
  searchTerm?: string;
  filters?: Record<string, string>;
  sort?: Record<string, SortDirection>;
  includeDetail?: boolean;
};
