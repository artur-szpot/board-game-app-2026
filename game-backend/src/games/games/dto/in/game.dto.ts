import { ApiProperty } from '@nestjs/swagger';
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

import { HelperResponse } from '../../../helpers/dto/out/helper.response';
import { ScoringSchemaResponse } from '../../../scoring-schemas/dto/out/scoring-schema.response';
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
  ownerId: string;

  @IsBoolean()
  private: boolean;

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
  @Type(() => ScoringSchemaResponse)
  @ValidateNested({ each: true })
  scoringSchemas: ScoringSchemaResponse[];

  @IsArray()
  @IsString({ each: true })
  helperIds: string[];

  @IsArray()
  @Type(() => HelperResponse)
  @ValidateNested({ each: true })
  helpers: HelperResponse[];

  @IsDate()
  createdOn: Date;

  @IsDate()
  updatedOn: Date;
}
