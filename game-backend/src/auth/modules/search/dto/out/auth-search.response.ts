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

import { AdminDataType } from '../../enums/AdminDataType.enum';

export class AuthSearchResult {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AdminDataType, enumName: 'AdminDataType' })
  @IsEnum(AdminDataType)
  type: AdminDataType;

  @IsObject()
  @IsOptional()
  detail?: object;
}

export class AuthSearchResponse {
  @ApiProperty({ type: () => [AuthSearchResult] })
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => AuthSearchResult)
  @ValidateNested({ each: true })
  results: AuthSearchResult[];

  @ApiProperty({ minimum: 0, example: 12 })
  @IsInt()
  @Min(0)
  total: number;
}
