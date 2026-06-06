import { Logger } from '@nestjs/common';
import { Permission } from '../domain/Permission';
import { PermissionDto } from '../dto/in/permission.dto';
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
