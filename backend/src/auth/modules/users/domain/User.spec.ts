import { Logger } from '@nestjs/common';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { Role } from '@auth/modules/roles/domain/Role';
import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

import { UserDto } from '../dto/in/user.dto';
import { userMapper } from '../mappers/user.mapper';
import { User } from './User';

describe('User', () => {
  const logger = new Logger('UserTest');

  it('should create a User based on correct props without ID', async () => {
    const props = {
      username: 'text',
      email: 'test@test.com',
      joinedDate: '2026-02-01T12:34:56.000Z',
      lastLogin: '2026-02-03T15:16:25.123Z',
      roles: [
        {
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
        },
      ],
    };
    const entity = new User(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(User);
    expect(entity.toString()).toEqual(`User "${props.username}"`);
    expect(entity.getProps()).toEqual({
      id: 'mocked-id',
      ...props,
      roles: props.roles.map((role) => new Role(logger, role)),
      joinedDate: new Date('2026-02-01T12:34:56.000Z'),
      lastLogin: new Date('2026-02-03T15:16:25.123Z'),
    });
  });

  it('should create a User based on correct props with ID', async () => {
    const props = {
      id: '1',
      username: 'text',
      email: 'test@test.com',
      joinedDate: '2026-02-01T12:34:56.000Z',
      lastLogin: '2026-02-03T15:16:25.123Z',
      roles: [
        {
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
        },
      ],
    };
    const entity = new User(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(User);
    expect(entity.toString()).toEqual(`User "${props.username}"`);
    expect(entity.getProps()).toEqual({
      ...props,
      roles: props.roles.map((role) => new Role(logger, role)),
      joinedDate: new Date('2026-02-01T12:34:56.000Z'),
      lastLogin: new Date('2026-02-03T15:16:25.123Z'),
    });
  });

  it('should create a User based on correct DTO', async () => {
    const dto: UserDto = {
      id: '1',
      username: 'text',
      email: 'test@test.com',
      joinedDate: '2026-02-01T12:34:56.000Z',
      roles: [
        {
          id: '2',
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
        },
      ],
    };
    const entity = userMapper.fromDto.toDomain(dto);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(User);
    expect(entity.toString()).toEqual(`User "${dto.username}"`);
    expect(entity.getProps()).toEqual({
      ...dto,
      roles: dto.roles.map((role) => new Role(logger, role)),
      joinedDate: new Date(dto.joinedDate),
      lastLogin: undefined,
      password: undefined,
    });
  });

  it('should fail to create a User based on incorrect props', async () => {
    const props = {
      id: 1,
      username: 'text',
      email: '',
      joinedDate: 'abc',
      roles: [
        {
          id: '2',
          description: 'text',
          name: 'test',
          permissions: [
            {
              id: '1',
              description: 'text',
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.TODOS,
            },
          ],
        },
      ],
    };
    try {
      new User(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('id: NonEmptyString');
      expect(error.message).toContain('email: NonEmptyString');
      expect(error.message).toContain('joinedDate: DateFromISOString');
    }
  });

  it('should fail to create a User based on incomplete props', async () => {
    const props = {
      username: 'text',
      roles: [
        {
          id: '2',
          description: 'text',
          name: 'test',
          protectedRole: true,
          permissions: [
            {
              description: 'text',
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.TODOS,
            },
          ],
        },
      ],
    };
    try {
      new User(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('email: NonEmptyString');
      expect(error.message).toContain('joinedDate: DateFromISOString');
    }
  });
});
