import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckTagNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  public?: boolean;

  // Excluded from the lookup so an edited tag does not clash with itself.
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: string;
}
