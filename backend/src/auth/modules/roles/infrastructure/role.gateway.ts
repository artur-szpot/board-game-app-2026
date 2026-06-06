import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';
import { CreateRoleDto } from '../dto/in/create-role.dto';
import { UpdateRoleDto } from '../dto/in/update-role.dto';
import { RoleResponse } from '../dto/out/role.response';

export interface RoleGateway {
  getById(roleId: string): Promise<RoleResponse>;
  getByName(roleName: string): Promise<RoleResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<RoleResponse>>;
  create(input: CreateRoleDto): Promise<RoleResponse>;
  update(roleId: string, input: UpdateRoleDto): Promise<RoleResponse>;
  delete(roleId: string): Promise<RoleResponse>;
}

export const ROLE_GATEWAY = Symbol('ROLE_GATEWAY');
