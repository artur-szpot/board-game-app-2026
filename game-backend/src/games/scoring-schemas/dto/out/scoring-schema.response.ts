import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { ScoringSchemaDefinitionDto } from '../schema/scoring-schema-definition.dto';

export class ScoringSchemaResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsBoolean()
  private: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @Type(() => ScoringSchemaDefinitionDto)
  @ValidateNested()
  schema: ScoringSchemaDefinitionDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
