import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SetDataDto } from './set-data.dto';
import { SET_IDENTIFIER } from '../../set-data.validator';

export class SetResponse {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty()
  @IsBoolean()
  private: boolean;

  @ApiProperty({ pattern: SET_IDENTIFIER.source })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ApiProperty({
    type: SetDataDto,
    description:
      'Helper data set: ordered properties and named items with string-valued property maps. Item translations use helper.set.<setName>.<itemName>.',
    example: {
      properties: ['category'],
      items: [{ name: 'firstCard', properties: { category: '' } }],
    },
  })
  data: object;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  createdOn: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  updatedOn: string;
}
