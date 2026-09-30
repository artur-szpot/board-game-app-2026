import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    description:
      'Always an array: validation failures and business-rule rejections share this shape.',
    example: ['email must be an email', 'password should not be empty'],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    description: 'Request path',
    example: '/auth/login',
  })
  path: string;

  @ApiProperty({
    description: 'Time the error was produced',
    example: '2026-08-01T07:30:00.000Z',
  })
  timestamp: string;
}
