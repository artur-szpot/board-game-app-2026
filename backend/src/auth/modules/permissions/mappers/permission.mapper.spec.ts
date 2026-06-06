import { Permission } from '../domain/Permission';
import { PermissionLevel } from '../enums/permission-level.enum';
import { PermissionType } from '../enums/permission-type.enum';
import { permissionMapper } from './permission.mapper';

describe('permissionMapper', () => {
  const permissionDto = {
    permissionType: PermissionType.PERMISSIONS,
    description: 'text',
    permissionLevel: PermissionLevel.CREATE,
  };

  describe('from DTO to Entity', () => {
    it('should return Permission Entity if arguments are correct', () => {
      const result = permissionMapper.fromDto.toDomain(permissionDto);
      expect(result).toBeInstanceOf(Permission);
      expect(result.getProps()).toStrictEqual({
        ...permissionDto,
        id: 'mocked-id',
      });
    });
  });

  describe('from Entity to response', () => {
    it('should return PermissionResponse from a Permission Entity', () => {
      const permission = permissionMapper.fromDto.toDomain(permissionDto);
      const result = permissionMapper.fromDomain.toResponse(permission);
      expect(result).toStrictEqual(permissionDto);
    });
  });
});
