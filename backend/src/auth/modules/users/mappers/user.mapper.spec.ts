import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { roleMapper } from '@auth/modules/roles/mappers/role.mapper';

import { User } from '../domain/User';
import { userMapper } from './user.mapper';

describe('userMapper', () => {
  const userDto = {
    id: '1',
    email: 'test@test.com',
    username: 'Test User',
    joinedDate: '2025-09-18T19:56:17.000Z',
    roles: [
      {
        id: '1',
        description: 'text',
        name: 'test role',
        protectedRole: true,
        permissions: [
          {
            permissionType: PermissionType.PERMISSIONS,
            description: 'text',
            permissionLevel: PermissionLevel.CREATE,
          },
        ],
      },
    ],
  };

  describe('from DTO to Entity', () => {
    it('should return User Entity if arguments are correct', () => {
      const result = userMapper.fromDto.toDomain(userDto);
      expect(result).toBeInstanceOf(User);
      expect(result.getProps()).toStrictEqual({
        ...userDto,
        joinedDate: new Date(userDto.joinedDate),
        lastLogin: undefined,
        password: undefined,
        roles: userDto.roles.map(roleMapper.fromDto.toDomain),
      });
    });
  });

  describe('from Entity to response', () => {
    it('should return UserResponse from a User Entity', () => {
      const user = userMapper.fromDto.toDomain(userDto);
      const result = userMapper.fromDomain.toResponse(user);
      expect(result).toStrictEqual({
        ...userDto,
        roles: userDto.roles
          .map(roleMapper.fromDto.toDomain)
          .map(roleMapper.fromDomain.toResponse),
      });
    });
  });
});
