import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsObject,
    IsString,
    Validate,
} from 'class-validator';

import { ScoreValuesMapValidator } from './score-values-map.validator';

export class GameScoreValuesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  players: string[];

  @ApiProperty({
    description: 'Raw per-row scores: rowId -> player -> value.',
    type: 'object',
    additionalProperties: {
      type: 'object',
      additionalProperties: { type: 'number' },
    },
  })
  @IsObject()
  @Validate(ScoreValuesMapValidator)
  values: Record<string, Record<string, number>>;
}
