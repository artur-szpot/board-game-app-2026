import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export interface LocationPathResponse {
  name: string;
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

  @IsObject({ each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  path: LocationPathResponse[];

  @IsString()
  @IsNotEmpty()
  createdOn: string;

  @IsString()
  @IsNotEmpty()
  updatedOn: string;
}
