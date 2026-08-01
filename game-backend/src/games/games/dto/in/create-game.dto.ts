import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';

import { GameLength } from './game-length.enum';
import { MaxPlayersGreaterThanOrEqualToMinPlayersValidator } from './max-players-greater-than-or-equal-to-min-players.validator';

export class CreateGameLocationDto {
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsBoolean()
  @IsOptional()
  isGameId?: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GameLength, enumName: 'GameLength' })
  @IsEnum(GameLength)
  @IsNotEmpty()
  length: GameLength;

  @IsInt()
  @Min(1)
  minPlayers: number;

  @IsInt()
  @Min(1)
  @Validate(MaxPlayersGreaterThanOrEqualToMinPlayersValidator)
  maxPlayers: number;

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
