import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
