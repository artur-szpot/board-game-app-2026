import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsString } from 'class-validator';

export class TranslationLookupResponse {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { 'helper.general.firstPlayer': 'Pierwszy gracz' },
  })
  @IsObject()
  translations: Record<string, string>;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  missing: string[];
}
