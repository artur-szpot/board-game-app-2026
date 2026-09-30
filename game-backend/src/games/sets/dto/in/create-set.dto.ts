import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateSetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'Set items: { items: [{ value: integer, label: [code, params?] }] }',
    example: { items: [{ value: 1, label: ['helper.set.card', { n: 1 }] }] },
  })
  @IsObject()
  data: object;
}
