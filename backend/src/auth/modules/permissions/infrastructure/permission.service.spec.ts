import { InternalError, NotFoundError } from '@common/errors/service-errors';
import { PermissionRepository } from '@db/repositories/permission.repository';

import { PermissionDto } from '../dto/in/permission.dto';
import { PermissionLevel } from '../enums/permission-level.enum';
import { PermissionType } from '../enums/permission-type.enum';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  const mockRepository: PermissionRepository = jest.requireMock(
    '@db/repositories/permission.repository',
  );
  const service = new PermissionService(mockRepository);

  const testPermissionType = PermissionType.TODOS;
  const testPermissionDto: PermissionDto = {
    permissionType: PermissionType.TODOS,
    description: 'text',
    permissionLevel: PermissionLevel.READ,
  };
  const testPermissionDto2: PermissionDto = {
    permissionType: PermissionType.USERS,
    description: 'text',
    permissionLevel: PermissionLevel.READ,
  };

  describe('getByType', () => {
    it('should get permission by type', async () => {
      mockRepository.getPermissionByType = jest
        .fn()
        .mockResolvedValueOnce(testPermissionDto);

      const result = await service.getByType(testPermissionType);

      expect(mockRepository.getPermissionByType).toHaveBeenCalledWith(
        testPermissionType,
      );
      expect(mockRepository.getPermissionByType).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(testPermissionDto);
    });

    it('should throw NotFoundError if permission is not found', async () => {
      mockRepository.getPermissionByType = jest
        .fn()
        .mockResolvedValueOnce(null);

      try {
        await service.getByType(testPermissionType);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getPermissionByType).toHaveBeenCalledWith(
          testPermissionType,
        );
        expect(mockRepository.getPermissionByType).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getPermissionByType = jest
        .fn()
        .mockRejectedValueOnce(new Error());

      try {
        await service.getByType(testPermissionType);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getPermissionByType).toHaveBeenCalledWith(
          testPermissionType,
        );
        expect(mockRepository.getPermissionByType).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('getMany', () => {
    it('should get all permissions without pagination specified', async () => {
      mockRepository.getManyPermissions = jest
        .fn()
        .mockResolvedValueOnce([testPermissionDto, testPermissionDto2]);
      mockRepository.getAllPermissionsCount = jest
        .fn()
        .mockResolvedValueOnce(2);

      const result = await service.getMany();

      expect(mockRepository.getManyPermissions).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyPermissions).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllPermissionsCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({
        page: [testPermissionDto, testPermissionDto2],
        total: 2,
      });
    });

    it('should get paginated permissions', async () => {
      mockRepository.getManyPermissions = jest
        .fn()
        .mockResolvedValueOnce([testPermissionDto]);
      mockRepository.getAllPermissionsCount = jest
        .fn()
        .mockResolvedValueOnce(2);
      const pagination = { pageSize: 1, pageNumber: 0 };

      const result = await service.getMany(pagination);

      expect(mockRepository.getManyPermissions).toHaveBeenCalledWith(
        pagination,
      );
      expect(mockRepository.getManyPermissions).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllPermissionsCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({ page: [testPermissionDto], total: 2 });
    });

    it('should return empty response if no permissions found', async () => {
      mockRepository.getManyPermissions = jest.fn().mockResolvedValueOnce([]);
      mockRepository.getAllPermissionsCount = jest
        .fn()
        .mockResolvedValueOnce(0);

      const result = await service.getMany();

      expect(mockRepository.getManyPermissions).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyPermissions).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllPermissionsCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({ page: [], total: 0 });
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getManyPermissions = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      mockRepository.getAllPermissionsCount = jest
        .fn()
        .mockResolvedValueOnce(2);

      try {
        await service.getMany();
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getManyPermissions).toHaveBeenCalledWith(
          undefined,
        );
        expect(mockRepository.getManyPermissions).toHaveBeenCalledTimes(1);
        expect(mockRepository.getAllPermissionsCount).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });
});
