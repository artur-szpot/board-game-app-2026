import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class ListGameScoresQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  gameId?: string;

  @ApiPropertyOptional({ type: Number, default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  pageNumber?: number;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number;
}
