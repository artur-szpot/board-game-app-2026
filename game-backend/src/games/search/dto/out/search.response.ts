import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { GameDataType } from '@common/enums/GameDataType.enum';

export class SearchResult {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: GameDataType, enumName: 'GameDataType' })
  @IsEnum(GameDataType)
  type: GameDataType;

  @IsObject()
  @IsOptional()
  detail?: object;
}

export class SearchResponse {
  @ApiProperty({ type: () => [SearchResult] })
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => SearchResult)
  @ValidateNested({ each: true })
  results: SearchResult[];

  @ApiProperty({ minimum: 0, example: 42 })
  @IsInt()
  @Min(0)
  total: number;
}
