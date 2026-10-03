import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SET_IDENTIFIER } from '../../set-data.validator';
import { SetDataDto } from '../out/set-data.dto';

export class UpdateSetDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, pattern: SET_IDENTIFIER.source })
  @Matches(SET_IDENTIFIER, { message: 'name must be camelCase' })
  name?: string;

  @ApiProperty({
    required: false,
    type: SetDataDto,
    description:
      'Ordered unique camelCase properties and items with unique camelCase names. Each item has exactly the declared property keys with string values.',
  })
  @IsObject()
  @IsOptional()
  data?: object;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
