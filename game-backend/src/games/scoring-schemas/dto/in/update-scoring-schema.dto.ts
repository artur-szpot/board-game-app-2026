import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { ScoringSchemaDefinitionDto } from '../schema/scoring-schema-definition.dto';

export class UpdateScoringSchemaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  @Type(() => ScoringSchemaDefinitionDto)
  @ValidateNested()
  schema?: ScoringSchemaDefinitionDto;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
