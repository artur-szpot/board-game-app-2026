import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { GameScoreValuesDto } from './game-score-values.dto';

export class UpdateGameScoreDto {
  @IsString()
  @IsOptional()
  gameId?: string;

  @IsDateString()
  @IsOptional()
  playedOn?: string;

  @IsString()
  @IsOptional()
  schemaId?: string;

  @IsObject()
  @IsOptional()
  @Type(() => GameScoreValuesDto)
  @ValidateNested()
  scores?: GameScoreValuesDto;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
