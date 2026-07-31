import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { SortDirection } from '@common/dto/in/get-many-items.dto';
import { GameDataType } from '@common/enums/GameDataType.enum';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';

export class SearchQueryDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GameDataType, { each: true })
  types: GameDataType[];

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @IsOptional()
  @IsObject()
  filters?: Record<string, string>;

  @IsOptional()
  @IsObject()
  sort?: Record<string, SortDirection>;

  @IsOptional()
  @IsBoolean()
  includeDetail?: boolean;
}
