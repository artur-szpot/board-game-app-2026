import { Logger } from '@nestjs/common';

import { permissionMapper } from '@auth/modules/permissions/mappers/permission.mapper';

import { Role } from '../domain/Role';
import { RoleDto } from '../dto/in/role.dto';
import { RoleResponse } from '../dto/out/role.response';

const logger = new Logger('RoleMapper');

export const roleMapper = {
  fromDto: {
    toDomain: (dto: RoleDto): Role => {
      return new Role(logger, {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
        protectedRole: dto.protectedRole,
      });
    },
  },
  fromDomain: {
    toResponse: (role: Role): RoleResponse => {
      const { id, description, name, protectedRole, permissions } =
        role.getProps();
      return {
        id,
        description,
        name,
        protectedRole,
        permissions: permissions.map(permissionMapper.fromDomain.toResponse),
      };
    },
  },
};
