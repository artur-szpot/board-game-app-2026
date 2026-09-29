import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

import { GameScoreResponse } from './game-score.response';

export class PaginatedGameScoresResponse {
  @ApiProperty({ type: () => GameScoreResponse, isArray: true })
  @IsArray()
  @Type(() => GameScoreResponse)
  @ValidateNested({ each: true })
  page: GameScoreResponse[];

  @IsInt()
  @Min(0)
  total: number;
}
