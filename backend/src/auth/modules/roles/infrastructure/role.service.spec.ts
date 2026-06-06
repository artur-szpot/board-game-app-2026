import { BadRequestException } from '@nestjs/common';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { InternalError, NotFoundError } from '@common/errors/service-errors';
import { RoleRepository } from '@db/repositories/role.repository';

import { CreateRoleDto } from '../dto/in/create-role.dto';
import { RoleDto } from '../dto/in/role.dto';
import { UpdateRoleDto } from '../dto/in/update-role.dto';
import { RoleService } from './role.service';

describe('RoleService', () => {
  const mockRepository: RoleRepository = jest.requireMock(
    '@db/repositories/role.repository',
  );
  const service = new RoleService(mockRepository);

  const testRoleId = 'testRoleId';
  const testRoleDto: RoleDto = {
    id: testRoleId,
    description: 'text',
    name: 'Test Role',
    protectedRole: false,
    permissions: [
      {
        permissionType: PermissionType.TODOS,
        description: 'text',
        permissionLevel: PermissionLevel.READ,
      },
    ],
  };
  const testRoleDto2: RoleDto = {
    id: 'testRole2',
    description: 'text',
    name: 'Test Role',
    protectedRole: false,
    permissions: [
      {
        permissionType: PermissionType.TODOS,
        description: 'text',
        permissionLevel: PermissionLevel.READ,
      },
    ],
  };

  describe('getById', () => {
    it('should get role by ID', async () => {
      mockRepository.getRoleById = jest.fn().mockResolvedValueOnce(testRoleDto);

      const result = await service.getById(testRoleId);

      expect(mockRepository.getRoleById).toHaveBeenCalledWith(testRoleId);
      expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(testRoleDto);
    });

    it('should throw NotFoundError if role is not found', async () => {
      mockRepository.getRoleById = jest.fn().mockResolvedValueOnce(null);

      try {
        await service.getById(testRoleId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(testRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getRoleById = jest.fn().mockRejectedValueOnce(new Error());

      try {
        await service.getById(testRoleId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(testRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('getMany', () => {
    it('should get all roles without pagination specified', async () => {
      mockRepository.getManyRoles = jest
        .fn()
        .mockResolvedValueOnce([testRoleDto, testRoleDto2]);
      mockRepository.getAllRolesCount = jest.fn().mockResolvedValueOnce(2);

      const result = await service.getMany();

      expect(mockRepository.getManyRoles).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyRoles).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllRolesCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({
        page: [testRoleDto, testRoleDto2],
        total: 2,
      });
    });

    it('should get paginated roles', async () => {
      mockRepository.getManyRoles = jest
        .fn()
        .mockResolvedValueOnce([testRoleDto]);
      mockRepository.getAllRolesCount = jest.fn().mockResolvedValueOnce(2);
      const pagination = { pageSize: 1, pageNumber: 0 };

      const result = await service.getMany(pagination);

      expect(mockRepository.getManyRoles).toHaveBeenCalledWith(pagination);
      expect(mockRepository.getManyRoles).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllRolesCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({ page: [testRoleDto], total: 2 });
    });

    it('should return empty response if no roles found', async () => {
      mockRepository.getManyRoles = jest.fn().mockResolvedValueOnce([]);
      mockRepository.getAllRolesCount = jest.fn().mockResolvedValueOnce(0);

      const result = await service.getMany();

      expect(mockRepository.getManyRoles).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyRoles).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllRolesCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({ page: [], total: 0 });
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getManyRoles = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      mockRepository.getAllRolesCount = jest.fn().mockResolvedValueOnce(2);

      try {
        await service.getMany();
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getManyRoles).toHaveBeenCalledWith(undefined);
        expect(mockRepository.getManyRoles).toHaveBeenCalledTimes(1);
        expect(mockRepository.getAllRolesCount).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('create', () => {
    const createInput: CreateRoleDto = {
      description: 'text',
      name: 'Test Role Name',
      permissions: [
        {
          permissionType: PermissionType.USERS,
          permissionLevel: PermissionLevel.READ,
        },
      ],
    };
    const createdRoleDto: RoleDto = {
      id: 'autogenerated-id',
      description: 'text',
      name: 'Test Role Name',
      protectedRole: false,
      permissions: [
        {
          description: 'text',
          permissionType: PermissionType.USERS,
          permissionLevel: PermissionLevel.READ,
        },
      ],
    };

    it('should create role from correct input', async () => {
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.createRole = jest
        .fn()
        .mockResolvedValueOnce(createdRoleDto);

      const result = await service.create(createInput);

      expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
        createInput.name,
      );
      expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
      expect(mockRepository.createRole).toHaveBeenCalledWith(createInput);
      expect(mockRepository.createRole).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(createdRoleDto);
    });

    it('should throw BadRequestException if permissions are not unique', async () => {
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.createRole = jest
        .fn()
        .mockResolvedValueOnce(createdRoleDto);

      try {
        await service.create({
          ...createInput,
          permissions: [
            {
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.PERMISSIONS,
            },
            {
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.USERS,
            },
            {
              permissionLevel: PermissionLevel.FULL,
              permissionType: PermissionType.PERMISSIONS,
            },
          ],
        });
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(0);
        expect(mockRepository.createRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if name is already being used', async () => {
      mockRepository.getRoleByName = jest
        .fn()
        .mockResolvedValueOnce(createdRoleDto);
      mockRepository.createRole = jest
        .fn()
        .mockResolvedValueOnce(createdRoleDto);

      try {
        await service.create(createInput);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          createInput.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.createRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getRoleByName = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      mockRepository.createRole = jest
        .fn()
        .mockResolvedValueOnce(createdRoleDto);

      try {
        await service.create(createInput);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          createInput.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.createRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('update', () => {
    const updateInputName: UpdateRoleDto = {
      name: 'Update Test',
    };
    const updateInputDescription: UpdateRoleDto = {
      description: 'New Description',
    };
    const toUpdateRoleId = 'updatedRoleId';
    const updatedRoleDto: RoleDto = {
      id: toUpdateRoleId,
      description: 'text',
      name: 'Test Role',
      protectedRole: false,
      permissions: [
        {
          permissionType: PermissionType.TODOS,
          description: 'text',
          permissionLevel: PermissionLevel.READ,
        },
      ],
    };

    it('should update role based on correct input', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      const result = await service.update(toUpdateRoleId, updateInputName);

      expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
      expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
      expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
        updateInputName.name,
      );
      expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateRole).toHaveBeenCalledWith(
        toUpdateRoleId,
        updateInputName,
      );
      expect(mockRepository.updateRole).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(updatedRoleDto);
    });

    it('should update role based on correct input (do not check name if not being updated)', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      const result = await service.update(
        toUpdateRoleId,
        updateInputDescription,
      );

      expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
      expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
      expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(0);
      expect(mockRepository.updateRole).toHaveBeenCalledWith(
        toUpdateRoleId,
        updateInputDescription,
      );
      expect(mockRepository.updateRole).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(updatedRoleDto);
    });

    it('should throw BadRequestException if no fields to update are given', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, {});
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(0);
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(0);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it("should throw BadRequestException if role doesn't exist", async () => {
      mockRepository.getRoleById = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, updateInputName);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          updateInputName.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if role is protected', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce({ ...updatedRoleDto, protectedRole: true });
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, updateInputName);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          updateInputName.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if permissions are not unique', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.getRoleByName = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, {
          ...updateInputName,
          permissions: [
            {
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.PERMISSIONS,
            },
            {
              permissionLevel: PermissionLevel.CREATE,
              permissionType: PermissionType.USERS,
            },
            {
              permissionLevel: PermissionLevel.FULL,
              permissionType: PermissionType.PERMISSIONS,
            },
          ],
        });
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(0);
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(0);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if name is already being used', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.getRoleByName = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, updateInputName);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          updateInputName.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getRoleById = jest.fn().mockRejectedValueOnce(new Error());
      mockRepository.getRoleByName = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);
      mockRepository.updateRole = jest
        .fn()
        .mockResolvedValueOnce(updatedRoleDto);

      try {
        await service.update(toUpdateRoleId, updateInputName);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toUpdateRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getRoleByName).toHaveBeenCalledWith(
          updateInputName.name,
        );
        expect(mockRepository.getRoleByName).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('delete', () => {
    const toDeleteRoleId = 'someRoleId';
    const deletedRoleDto: RoleDto = {
      id: 'autogenerated-id',
      description: 'text',
      name: 'Test Role',
      protectedRole: false,
      permissions: [
        {
          permissionType: PermissionType.TODOS,
          description: 'text',
          permissionLevel: PermissionLevel.READ,
        },
      ],
    };

    it('should delete role if it exists', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce(deletedRoleDto);
      mockRepository.deleteRole = jest
        .fn()
        .mockResolvedValueOnce(deletedRoleDto);

      const result = await service.delete(toDeleteRoleId);

      expect(mockRepository.getRoleById).toHaveBeenCalledWith(toDeleteRoleId);
      expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
      expect(mockRepository.deleteRole).toHaveBeenCalledWith(toDeleteRoleId);
      expect(mockRepository.deleteRole).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(deletedRoleDto);
    });

    it("should throw BadRequestException if role doesn't exist", async () => {
      mockRepository.getRoleById = jest.fn().mockResolvedValueOnce(null);
      mockRepository.deleteRole = jest
        .fn()
        .mockResolvedValueOnce(deletedRoleDto);

      try {
        await service.delete(toDeleteRoleId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toDeleteRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.deleteRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if role is protected', async () => {
      mockRepository.getRoleById = jest
        .fn()
        .mockResolvedValueOnce({ ...deletedRoleDto, protectedRole: true });
      mockRepository.deleteRole = jest
        .fn()
        .mockResolvedValueOnce(deletedRoleDto);

      try {
        await service.delete(toDeleteRoleId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toDeleteRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.deleteRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getRoleById = jest.fn().mockRejectedValueOnce(new Error());
      mockRepository.deleteRole = jest
        .fn()
        .mockResolvedValueOnce(deletedRoleDto);

      try {
        await service.delete(toDeleteRoleId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getRoleById).toHaveBeenCalledWith(toDeleteRoleId);
        expect(mockRepository.getRoleById).toHaveBeenCalledTimes(1);
        expect(mockRepository.deleteRole).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });
});
