import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  PermissionDefinition,
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';
import { JwtDto } from '../dto/in/jwt.dto';
import { PermissionPrecedence } from '../modules/permissions/enums/permission-level.enum';

@Injectable()
export class PermisionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionDefinition[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }

    const {
      user: { permissions },
    }: { user: JwtDto } = context.switchToHttp().getRequest();

    requiredPermissions.forEach(([permissionType, requiredPermissionLevel]) => {
      const userPermissionLevel = permissions.find(
        (permission) => permission[0] === permissionType,
      )?.[1];
      if (
        PermissionPrecedence.indexOf(userPermissionLevel) <
        PermissionPrecedence.indexOf(requiredPermissionLevel)
      ) {
        return false;
      }
    });

    return true;
  }
}
