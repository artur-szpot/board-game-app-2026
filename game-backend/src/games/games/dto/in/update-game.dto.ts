import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    Validate,
    ValidateNested,
} from 'class-validator';

import { CreateGameLocationDto } from './create-game.dto';
import { GameLength } from './game-length.enum';
import { MaxPlayersGreaterThanOrEqualToMinPlayersValidator } from './max-players-greater-than-or-equal-to-min-players.validator';

export class UpdateGameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ enum: GameLength, enumName: 'GameLength' })
  @IsEnum(GameLength)
  @IsOptional()
  length?: GameLength;

  @IsInt()
  @Min(1)
  @IsOptional()
  minPlayers?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Validate(MaxPlayersGreaterThanOrEqualToMinPlayersValidator)
  maxPlayers?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @Type(() => CreateGameLocationDto)
  @ValidateNested({ each: true })
  @IsOptional()
  locations?: CreateGameLocationDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scoringSchemaIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  helperIds?: string[];
}
