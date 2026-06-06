import { IsEnum, IsNotEmpty } from 'class-validator';

import { PermissionType } from '../../enums/permission-type.enum';

export class GetPermissionByTypeDto {
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissionType: PermissionType;
}
