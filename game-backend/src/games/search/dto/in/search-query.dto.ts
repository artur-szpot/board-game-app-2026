import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    enum: GameDataType,
    enumName: 'GameDataType',
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GameDataType, { each: true })
  types: GameDataType[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ type: () => PaginationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, string>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['asc', 'desc'] },
  })
  @IsOptional()
  @IsObject()
  sort?: Record<string, SortDirection>;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  includeDetail?: boolean;
}
