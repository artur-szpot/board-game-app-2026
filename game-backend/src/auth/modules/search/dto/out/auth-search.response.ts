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

import { AdminDataType } from '../../enums/AdminDataType.enum';

export class AuthSearchResult {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AdminDataType)
  type: AdminDataType;

  @IsObject()
  @IsOptional()
  detail?: object;
}

export class AuthSearchResponse {
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => AuthSearchResult)
  @ValidateNested({ each: true })
  results: AuthSearchResult[];

  @IsInt()
  @Min(0)
  total: number;
}
