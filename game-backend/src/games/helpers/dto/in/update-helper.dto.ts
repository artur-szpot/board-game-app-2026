import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateHelperDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  logic?: unknown;
}
