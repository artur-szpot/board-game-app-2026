import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  createdOn: string;

  @IsString()
  @IsNotEmpty()
  updatedOn: string;
}
