import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { GameLength } from './game-length.enum';

export class GameLocationPathDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GameLocationDto {
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsBoolean()
  isGameId: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => GameLocationPathDto)
  @ValidateNested({ each: true })
  path: GameLocationPathDto[];
}

export class GameTagDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class GameDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GameLength)
  @IsNotEmpty()
  length: GameLength;

  @IsInt()
  @Min(1)
  minPlayers: number;

  @IsInt()
  @Min(1)
  maxPlayers: number;

  @IsArray()
  @Type(() => GameTagDto)
  @ValidateNested({ each: true })
  tags: GameTagDto[];

  @IsArray()
  @Type(() => GameLocationDto)
  @ValidateNested({ each: true })
  locations: GameLocationDto[];

  @IsArray()
  @IsString({ each: true })
  scoringSchemaIds: string[];

  @IsArray()
  @IsString({ each: true })
  helperIds: string[];

  @IsDate()
  createdOn: Date;

  @IsDate()
  updatedOn: Date;
}
