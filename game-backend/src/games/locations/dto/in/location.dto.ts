import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  path: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  pathIds: string[];

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
