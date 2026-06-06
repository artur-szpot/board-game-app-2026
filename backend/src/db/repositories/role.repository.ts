import { CreateRoleDto } from '@auth/modules/roles/dto/in/create-role.dto';
import { RoleDto } from '@auth/modules/roles/dto/in/role.dto';
import { UpdateRoleDto } from '@auth/modules/roles/dto/in/update-role.dto';
import { Pagination } from '@common/pagination/pagination';

export interface RoleRepository {
  getRoleById(roleId: string): Promise<RoleDto | null>;
  getRoleByName(roleName: string): Promise<RoleDto | null>;
  getManyRoles(pagination?: Pagination): Promise<RoleDto[]>;
  getAllRolesCount(): Promise<number>;
  createRole(input: CreateRoleDto): Promise<RoleDto>;
  updateRole(roleId: string, input: UpdateRoleDto): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<RoleDto>;
}

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
