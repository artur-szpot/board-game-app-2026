import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsBoolean()
  isGameId: boolean;

  @IsString()
  @IsNotEmpty()
  createdOn: string;

  @IsString()
  @IsNotEmpty()
  updatedOn: string;
}
