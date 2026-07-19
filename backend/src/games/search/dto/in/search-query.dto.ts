import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { GameDataType } from '@common/enums/GameDataType.enum';

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
  filters?: Record<string, string>;
}
