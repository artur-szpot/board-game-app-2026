import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { permissionMapper } from '@auth/modules/permissions/mappers/permission.mapper';
import { roleMapper } from '@auth/modules/roles/mappers/role.mapper';

import { Role } from '../domain/Role';

describe('roleMapper', () => {
  const roleDto = {
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
  };

  describe('from DTO to Entity', () => {
    it('should return Role Entity if arguments are correct', () => {
      const result = roleMapper.fromDto.toDomain(roleDto);
      expect(result).toBeInstanceOf(Role);
      expect(result.getProps()).toStrictEqual({
        ...roleDto,
        permissions: roleDto.permissions.map(permissionMapper.fromDto.toDomain),
      });
    });
  });

  describe('from Entity to response', () => {
    it('should return RoleResponse from a Role Entity', () => {
      const role = roleMapper.fromDto.toDomain(roleDto);
      const result = roleMapper.fromDomain.toResponse(role);
      expect(result).toStrictEqual({
        ...roleDto,
        permissions: roleDto.permissions
          .map(permissionMapper.fromDto.toDomain)
          .map(permissionMapper.fromDomain.toResponse),
      });
    });
  });
});
