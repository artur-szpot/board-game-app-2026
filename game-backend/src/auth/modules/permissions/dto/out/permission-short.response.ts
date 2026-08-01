import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { PermissionLevel } from '../../enums/permission-level.enum';
import { PermissionType } from '../../enums/permission-type.enum';

export class PermissionShortResponse {
  @ApiProperty({ enum: PermissionType, enumName: 'PermissionType' })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissionType: PermissionType;

  @ApiPropertyOptional({ enum: PermissionLevel, enumName: 'PermissionLevel' })
  @IsEnum(PermissionLevel)
  @IsNotEmpty()
  @IsOptional()
  permissionLevel?: PermissionLevel;
}
