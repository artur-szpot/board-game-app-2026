import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { PermissionType } from '../../enums/permission-type.enum';

export class GetPermissionByTypeDto {
  @ApiProperty({ enum: PermissionType, enumName: 'PermissionType' })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissionType: PermissionType;
}
