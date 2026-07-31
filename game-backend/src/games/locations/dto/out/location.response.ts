import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class LocationPathResponse {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}

export class LocationResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => LocationPathResponse)
  @ValidateNested({ each: true })
  path: LocationPathResponse[];

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
