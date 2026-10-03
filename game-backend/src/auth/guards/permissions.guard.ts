import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  PermissionDefinition,
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';
import { JwtDto } from '../dto/in/jwt.dto';
import { hasRequiredPermission } from '../helpers/has-required-permission';

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

    return requiredPermissions.every(([type, level]) =>
      hasRequiredPermission(permissions, type, level),
    );
  }
}
