import { Type } from 'class-transformer';
import {
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { GameScoreValuesDto } from './game-score-values.dto';

export class CreateGameScoreDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsDateString()
  @IsOptional()
  playedOn?: string;

  @IsString()
  @IsNotEmpty()
  schemaId: string;

  @IsObject()
  @Type(() => GameScoreValuesDto)
  @ValidateNested()
  scores: GameScoreValuesDto;
}
