import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Min, ValidateIf } from 'class-validator';

export class PaginationDto {
  @ValidateIf((dto) => dto.pageNumber)
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  pageSize?: number;

  @ValidateIf((dto) => dto.pageSize)
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  pageNumber?: number;
}
