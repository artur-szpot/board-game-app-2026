import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { ScoringSchemaDefinitionDto } from '../../../scoring-schemas/dto/schema/scoring-schema-definition.dto';
import { GameScoreValuesDto } from './game-score-values.dto';

export class GameScoreDto {
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

  @IsDate()
  playedOn: Date;

  @IsString()
  @IsNotEmpty()
  schemaId: string;

  // Joined in from scoring_schemas on read paths; absent on write paths.
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

  @IsDate()
  createdOn: Date;

  @IsDate()
  updatedOn: Date;
}
