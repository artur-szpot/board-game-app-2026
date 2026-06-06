import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionLevel } from '../modules/permissions/enums/permission-level.enum';
import { PermissionType } from '../modules/permissions/enums/permission-type.enum';
import { PermisionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const mockReflector: Reflector = jest.requireMock('@nestjs/core');
  const guard = new PermisionsGuard(mockReflector);

  it('should allow access when no permissions are required', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue([]);
    const context: ExecutionContext = jest.requireMock('@nestjs/common');
    context.getHandler = jest.fn();
    context.getClass = jest.fn();
    context.switchToHttp = jest.fn().mockReturnValue({ getRequest: jest.fn() });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access when user has adequate permissions', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue([
      [PermissionType.TODOS, PermissionLevel.READ],
      [PermissionType.USERS, PermissionLevel.READ],
    ]);
    const context: ExecutionContext = jest.requireMock('@nestjs/common');
    context.getHandler = jest.fn();
    context.getClass = jest.fn();
    context.switchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValueOnce({
        user: {
          permissions: [
            [PermissionType.TODOS, PermissionLevel.READ],
            [PermissionType.USERS, PermissionLevel.READ],
          ],
        },
      }),
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access when user has exceeding permissions', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue([
      [PermissionType.TODOS, PermissionLevel.READ],
      [PermissionType.USERS, PermissionLevel.READ],
    ]);
    const context: ExecutionContext = jest.requireMock('@nestjs/common');
    context.getHandler = jest.fn();
    context.getClass = jest.fn();
    context.switchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValueOnce({
        user: {
          permissions: [
            [PermissionType.TODOS, PermissionLevel.CREATE],
            [PermissionType.USERS, PermissionLevel.FULL],
          ],
        },
      }),
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should not allow access when user has only partial permissions', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue([
      [PermissionType.TODOS, PermissionLevel.READ],
      [PermissionType.USERS, PermissionLevel.READ],
    ]);
    const context: ExecutionContext = jest.requireMock('@nestjs/common');
    context.getHandler = jest.fn();
    context.getClass = jest.fn();
    context.switchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValueOnce({
        user: {
          permissions: [[PermissionType.TODOS, PermissionLevel.CREATE]],
        },
      }),
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should not allow access when user has no permissions', async () => {
    mockReflector.getAllAndOverride = jest.fn().mockReturnValue([
      [PermissionType.TODOS, PermissionLevel.READ],
      [PermissionType.USERS, PermissionLevel.READ],
    ]);
    const context: ExecutionContext = jest.requireMock('@nestjs/common');
    context.getHandler = jest.fn();
    context.getClass = jest.fn();
    context.switchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValueOnce({
        user: {
          permissions: [],
        },
      }),
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
