import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { SortDirection } from '@common/dto/in/get-many-items.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';

import { AdminDataType } from '../../enums/AdminDataType.enum';

export class AuthSearchQueryDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AdminDataType, { each: true })
  types: AdminDataType[];

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @IsOptional()
  filters?: Record<string, string>;

  @IsOptional()
  sort?: Record<string, SortDirection>;

  @IsOptional()
  @IsBoolean()
  includeDetail?: boolean;
}
