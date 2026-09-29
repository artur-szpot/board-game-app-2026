import { ApiPropertyOptional } from '@nestjs/swagger';
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

import { ScoringSchemaDefinitionDto } from '../../../scoring-schemas/dto/schema/scoring-schema-definition.dto';
import { GameScoreValuesDto } from '../in/game-score-values.dto';

export class GameScoreResponse {
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
  gameId: string;

  @IsDateString()
  playedOn: string;

  @IsString()
  @IsNotEmpty()
  schemaId: string;

  // Only populated on read paths, where the schema is joined in.
  @ApiPropertyOptional({ type: ScoringSchemaDefinitionDto })
  @IsObject()
  @IsOptional()
  @Type(() => ScoringSchemaDefinitionDto)
  @ValidateNested()
  schema?: ScoringSchemaDefinitionDto;

  @IsString()
  @IsOptional()
  schemaName?: string;

  @IsObject()
  @Type(() => GameScoreValuesDto)
  @ValidateNested()
  scores: GameScoreValuesDto;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
