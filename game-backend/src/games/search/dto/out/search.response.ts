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

  @IsEnum(GameDataType)
  type: GameDataType;

  @IsObject()
  @IsOptional()
  detail?: object;
}

export class SearchResponse {
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => SearchResult)
  @ValidateNested({ each: true })
  results: SearchResult[];

  @IsInt()
  @Min(0)
  total: number;
}
