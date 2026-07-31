import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import { Logger } from '@nestjs/common';
import { Permission } from '../domain/Permission';
import { PermissionDto } from '../dto/in/permission.dto';
import { PermissionShortResponse } from '../dto/out/permission-short.response';
import { PermissionResponse } from '../dto/out/permission.response';

const logger = new Logger('PermissionMapper');

export const permissionMapper = {
  fromDto: {
    toDomain: (dto: PermissionDto): Permission => {
      return new Permission(logger, {
        description: dto.description,
        permissionType: dto.permissionType,
        permissionLevel: dto.permissionLevel,
      });
    },
  },
  fromDefinition: {
    toResponse: (permission: PermissionDefinition): PermissionShortResponse => {
      const [permissionType, permissionLevel] = permission;
      return {
        permissionType,
        permissionLevel,
      };
    },
  },
  fromDomain: {
    toResponse: (permission: Permission): PermissionResponse => {
      const { description, permissionType, permissionLevel } =
        permission.getProps();
      return {
        description,
        permissionType,
        permissionLevel,
      };
    },
  },
};
