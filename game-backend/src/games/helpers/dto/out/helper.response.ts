import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HelperResponse {
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description:
      'Versioned helper logic including data set aliases mapped to set IDs.',
  })
  @IsObject()
  logic: object;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  createdOn: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  updatedOn: string;
}
