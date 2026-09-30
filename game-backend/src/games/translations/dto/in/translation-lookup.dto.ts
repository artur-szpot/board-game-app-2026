import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';

export class TranslationLookupDto {
  @ApiProperty({ type: [String], example: ['helper.general.firstPlayer'] })
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  keys: string[];

  @ApiProperty({ example: 'pl' })
  @IsString()
  @Matches(/^[a-z]{2}$/)
  language: string;
}
