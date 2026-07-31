import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { PermissionDefinition } from '@auth/decorators/permissions.decorator';

export class JwtDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsArray()
  permissions: PermissionDefinition[];
}
