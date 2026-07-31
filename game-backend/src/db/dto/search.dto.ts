import { Pagination } from '@common/pagination/pagination';

export interface DbSearchDto {
  where?: string;
  orderBy?: string;
  pagination?: Pagination;
}
