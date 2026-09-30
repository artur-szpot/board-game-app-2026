import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    description:
      'Set items: { items: [{ value: integer, label: [code, params?] }] }',
  })
  @IsObject()
  @IsOptional()
  data?: object;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
