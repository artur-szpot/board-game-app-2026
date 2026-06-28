import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';

export class SearchQueryDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  types: string[];

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @IsOptional()
  filters?: Record<string, string>;
}
