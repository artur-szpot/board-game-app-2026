import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    example: ['email must be an email', 'password should not be empty'],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiPropertyOptional({
    description: 'Request path; included by some global exception filters',
    example: '/auth/login',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'Timestamp; included by some global exception filters',
    example: '2026-08-01T07:30:00.000Z',
  })
  timestamp?: string;
}
