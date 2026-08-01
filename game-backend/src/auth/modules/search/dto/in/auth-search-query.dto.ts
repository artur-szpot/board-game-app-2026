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
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';

import { AdminDataType } from '../../enums/AdminDataType.enum';

export class AuthSearchQueryDto {
  @ApiProperty({
    enum: AdminDataType,
    enumName: 'AdminDataType',
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AdminDataType, { each: true })
  types: AdminDataType[];

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
