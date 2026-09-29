import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Validate,
    ValidateNested,
} from 'class-validator';

import { RowNameRequiredWithoutIconValidator } from './row-name-required-without-icon.validator';
import { ScoringGroupMechanism } from './scoring-group-mechanism.enum';

export const SCORING_SCHEMA_VERSION = 1;

export class ScoringRowDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  @Validate(RowNameRequiredWithoutIconValidator)
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class ScoringCategoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ScoringRowDto)
  @ValidateNested({ each: true })
  rows: ScoringRowDto[];
}

export class ScoringGroupDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    enum: ScoringGroupMechanism,
    enumName: 'ScoringGroupMechanism',
  })
  @IsEnum(ScoringGroupMechanism)
  mechanism: ScoringGroupMechanism;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ScoringCategoryDto)
  @ValidateNested({ each: true })
  categories: ScoringCategoryDto[];
}

export class ScoringSchemaDefinitionDto {
  @IsInt()
  version: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ScoringGroupDto)
  @ValidateNested({ each: true })
  groups: ScoringGroupDto[];
}
