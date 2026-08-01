import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Min, ValidateIf } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    example: 20,
  })
  @ValidateIf((dto) => dto.pageNumber)
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Zero-based page index',
    minimum: 0,
    example: 0,
  })
  @ValidateIf((dto) => dto.pageSize)
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  pageNumber?: number;
}
