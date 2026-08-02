import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateHelperDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  logic?: unknown;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
