import { CreateRoleDto } from '@auth/modules/roles/dto/in/create-role.dto';
import { RoleDto } from '@auth/modules/roles/dto/in/role.dto';
import { UpdateRoleDto } from '@auth/modules/roles/dto/in/update-role.dto';
import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

export interface RoleRepository {
  getRoleById(roleId: string): Promise<RoleDto | null>;
  getRoleByName(roleName: string): Promise<RoleDto | null>;
  getManyRoles(dto?: GetManyItemsDto): Promise<RoleDto[]>;
  getRolesCount(dto?: GetManyItemsDto): Promise<number>;
  createRole(input: CreateRoleDto): Promise<RoleDto>;
  updateRole(roleId: string, input: UpdateRoleDto): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<RoleDto>;
}

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
