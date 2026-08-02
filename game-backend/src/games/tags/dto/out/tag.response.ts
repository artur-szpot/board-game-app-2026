import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagResponse {
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
