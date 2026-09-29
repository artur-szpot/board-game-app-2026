import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { ScoringSchemaDefinitionDto } from '../schema/scoring-schema-definition.dto';

export class CreateScoringSchemaDto {
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
}
