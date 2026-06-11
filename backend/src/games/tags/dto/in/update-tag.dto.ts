import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  parentId?: string;
}
