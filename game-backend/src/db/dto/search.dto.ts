import { IsObject, IsOptional, IsString } from 'class-validator';

import { Pagination } from '@common/pagination/pagination';

export class DbSearchDto {
  @IsString()
  @IsOptional()
  where?: string;

  @IsString()
  @IsOptional()
  orderBy?: string;

  @IsObject()
  @IsOptional()
  pagination?: Pagination;
}
