import { Logger } from '@nestjs/common';

import { Permission } from '@auth/modules/permissions/domain/Permission';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

import { RoleDto } from '../dto/in/role.dto';
import { roleMapper } from '../mappers/role.mapper';
import { Role } from './Role';

describe('Role', () => {
  const logger = new Logger('RoleTest');

  it('should create a Role based on correct props without ID', async () => {
    const props = {
      description: 'text',
      name: 'test',
      protectedRole: false,
      permissions: [
        {
          id: '1',
          description: 'text',
          permissionLevel: PermissionLevel.CREATE,
          permissionType: PermissionType.TODOS,
        },
      ],
    };
    const entity = new Role(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Role);
    expect(entity.toString()).toEqual(`Role "${props.name}"`);
    expect(entity.getProps()).toEqual({
      id: 'mocked-id',
      ...props,
      permissions: props.permissions.map(
        (permission) => new Permission(logger, permission),
      ),
    });
  });

  it('should create a Role based on correct props with ID', async () => {
    const props = {
      id: '1',
      description: 'text',
      name: 'test',
      protectedRole: false,
      permissions: [
        {
          id: '2',
          description: 'text',
          permissionLevel: PermissionLevel.CREATE,
          permissionType: PermissionType.TODOS,
        },
      ],
    };
    const entity = new Role(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Role);
    expect(entity.toString()).toEqual(`Role "${props.name}"`);
    expect(entity.getProps()).toEqual({
      ...props,
      permissions: props.permissions.map(
        (permission) => new Permission(logger, permission),
      ),
    });
  });

  it('should create a Role based on correct DTO', async () => {
    const dto: RoleDto = {
      id: '1',
      description: 'text',
      name: 'test',
      protectedRole: false,
      permissions: [
        {
          description: 'text',
          permissionLevel: PermissionLevel.CREATE,
          permissionType: PermissionType.TODOS,
        },
      ],
    };
    const entity = roleMapper.fromDto.toDomain(dto);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Role);
    expect(entity.toString()).toEqual(`Role "${dto.name}"`);
    expect(entity.getProps()).toEqual({
      ...dto,
      permissions: dto.permissions.map(
        (permission) => new Permission(logger, permission),
      ),
    });
  });

  it('should fail to create a Role based on incorrect props', async () => {
    const props = {
      id: 1,
      description: 'text',
      name: 'test',
      protectedRole: false,
      permissions: [
        {
          id: '2',
          description: 'text',
          permissionLevel: PermissionLevel.CREATE,
          permissionType: PermissionType.TODOS,
        },
      ],
    };
    try {
      new Role(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('id: NonEmptyString');
    }
  });

  it('should fail to create a Role based on incomplete props', async () => {
    const props = {
      name: 'test',
      protectedRole: false,
      permissions: [
        {
          id: '2',
          description: 'text',
          permissionLevel: PermissionLevel.CREATE,
          permissionType: PermissionType.TODOS,
        },
      ],
    };
    try {
      new Role(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('description: NonEmptyString');
    }
  });
});
