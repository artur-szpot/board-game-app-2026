import { PermissionDefinition } from '@auth/decorators/permissions.decorator';

export interface JwtDto {
  id: string;
  email: string;
  permissions: PermissionDefinition[];
}
