import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, Matches } from 'class-validator';
import { SET_IDENTIFIER } from '../../set-data.validator';
import { SetDataDto } from '../out/set-data.dto';

export class CreateSetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ pattern: SET_IDENTIFIER.source, example: 'bonusCards' })
  @Matches(SET_IDENTIFIER, { message: 'name must be camelCase' })
  name: string;

  @ApiProperty({
    type: SetDataDto,
    description:
      'Ordered unique camelCase properties and items with unique camelCase names. Each item has exactly the declared property keys with string values.',
    example: {
      properties: ['category'],
      items: [{ name: 'firstCard', properties: { category: '' } }],
    },
  })
  @IsObject()
  data: object;
}
