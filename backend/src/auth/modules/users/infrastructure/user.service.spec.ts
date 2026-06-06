import { BadRequestException } from '@nestjs/common';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { InternalError, NotFoundError } from '@common/errors/service-errors';
import { UserRepository } from '@db/repositories/user.repository';

import { CreateUserDto } from '../dto/in/create-user.dto';
import { UpdateUserDto } from '../dto/in/update-user.dto';
import { UserDto } from '../dto/in/user.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  const mockRepository: UserRepository = jest.requireMock(
    '@db/repositories/user.repository',
  );
  const service = new UserService(mockRepository);

  const testUserId = 'testUserId';
  const testUserDto: UserDto = {
    id: testUserId,
    email: 'test@test.com',
    joinedDate: new Date().toISOString(),
    username: 'Test User',
    password: 'hashed-password',
    roles: [
      {
        id: 'testRole',
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
      },
    ],
  };
  const testUserDto2: UserDto = {
    id: 'testUserId2',
    email: 'test2@test.com',
    joinedDate: new Date().toISOString(),
    username: 'Test User 2',
    password: 'hashed-password2',
    roles: [
      {
        id: 'testRole',
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
      },
    ],
  };

  describe('getById', () => {
    it('should get user by ID', async () => {
      mockRepository.getUserById = jest.fn().mockResolvedValueOnce(testUserDto);

      const result = await service.getById(testUserId);

      expect(mockRepository.getUserById).toHaveBeenCalledWith(testUserId);
      expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);

      const { password, ...other } = testUserDto;
      expect(result).toStrictEqual(other);
    });

    it('should throw NotFoundError if user is not found', async () => {
      mockRepository.getUserById = jest.fn().mockResolvedValueOnce(null);

      try {
        await service.getById(testUserId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(testUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getUserById = jest.fn().mockRejectedValueOnce(new Error());

      try {
        await service.getById(testUserId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(testUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('getMany', () => {
    it('should get all users without pagination specified', async () => {
      mockRepository.getManyUsers = jest
        .fn()
        .mockResolvedValueOnce([testUserDto, testUserDto2]);
      mockRepository.getAllUsersCount = jest.fn().mockResolvedValueOnce(2);

      const result = await service.getMany();

      expect(mockRepository.getManyUsers).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyUsers).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllUsersCount).toHaveBeenCalledTimes(1);

      const { password, ...other } = testUserDto;
      const { password: password2, ...other2 } = testUserDto2;
      expect(result).toStrictEqual({ page: [other, other2], total: 2 });
    });

    it('should get paginated users', async () => {
      mockRepository.getManyUsers = jest
        .fn()
        .mockResolvedValueOnce([testUserDto]);
      mockRepository.getAllUsersCount = jest.fn().mockResolvedValueOnce(2);
      const pagination = { pageSize: 1, pageNumber: 0 };

      const result = await service.getMany(pagination);

      expect(mockRepository.getManyUsers).toHaveBeenCalledWith(pagination);
      expect(mockRepository.getManyUsers).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllUsersCount).toHaveBeenCalledTimes(1);

      const { password, ...other } = testUserDto;
      expect(result).toStrictEqual({ page: [other], total: 2 });
    });

    it('should return empty response if no users found', async () => {
      mockRepository.getManyUsers = jest.fn().mockResolvedValueOnce([]);
      mockRepository.getAllUsersCount = jest.fn().mockResolvedValueOnce(0);

      const result = await service.getMany();

      expect(mockRepository.getManyUsers).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getManyUsers).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAllUsersCount).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual({ page: [], total: 0 });
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getManyUsers = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      mockRepository.getAllUsersCount = jest.fn().mockResolvedValueOnce(2);

      try {
        await service.getMany();
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getManyUsers).toHaveBeenCalledWith(undefined);
        expect(mockRepository.getManyUsers).toHaveBeenCalledTimes(1);
        expect(mockRepository.getAllUsersCount).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('create', () => {
    const createInput: CreateUserDto = {
      email: 'create-test@test.com',
      password: 'hashed-password',
      username: 'Create Test',
      roles: [{ roleId: 'test-role-id' }],
    };
    const createdUserDto: UserDto = {
      id: 'autogenerated-id',
      email: 'create-test@test.com',
      joinedDate: new Date().toISOString(),
      username: 'Create Test',
      password: 'hashed-password',
      roles: [
        {
          id: 'test-role-id',
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
        },
      ],
    };

    it('should create user from correct input', async () => {
      mockRepository.getUserByEmail = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.createUser = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);

      const result = await service.create(createInput);

      expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(
        createInput.email,
      );
      expect(mockRepository.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
        createInput.username,
      );
      expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
      expect(mockRepository.createUser).toHaveBeenCalledWith(createInput);
      expect(mockRepository.createUser).toHaveBeenCalledTimes(1);

      const { password, ...other } = createdUserDto;
      expect(result).toStrictEqual(other);
    });

    it('should throw BadRequestException if roles are not unique', async () => {
      mockRepository.getUserByEmail = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.createUser = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);

      try {
        await service.create({
          ...createInput,
          roles: [{ roleId: 'test' }, { roleId: 'test2' }, { roleId: 'test' }],
        });
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserByEmail).toHaveBeenCalledTimes(0);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(0);
        expect(mockRepository.createUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if email is already being used', async () => {
      mockRepository.getUserByEmail = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.createUser = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);

      try {
        await service.create(createInput);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(
          createInput.email,
        );
        expect(mockRepository.getUserByEmail).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          createInput.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.createUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if username is already being used', async () => {
      mockRepository.getUserByEmail = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getUserByUsername = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);
      mockRepository.createUser = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);

      try {
        await service.create(createInput);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(
          createInput.email,
        );
        expect(mockRepository.getUserByEmail).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          createInput.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.createUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getUserByEmail = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getUserByUsername = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      mockRepository.createUser = jest
        .fn()
        .mockResolvedValueOnce(createdUserDto);

      try {
        await service.create(createInput);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(
          createInput.email,
        );
        expect(mockRepository.getUserByEmail).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          createInput.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.createUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('update', () => {
    const updateInputUsername: UpdateUserDto = {
      username: 'Update Test',
    };
    const updateInputPassword: UpdateUserDto = {
      password: 'new-hashed-password',
    };
    const toUpdateUserId = 'updatedUserId';
    const updatedUserDto: UserDto = {
      id: toUpdateUserId,
      email: 'test@test.com',
      joinedDate: new Date().toISOString(),
      username: 'Update Test',
      password: 'hashed-password',
      roles: [
        {
          id: 'test-role-id',
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
        },
      ],
    };

    it('should update user based on correct input', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      const result = await service.update(toUpdateUserId, updateInputUsername);

      expect(mockRepository.getUserById).toHaveBeenCalledWith(toUpdateUserId);
      expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
        updateInputUsername.username,
      );
      expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateUser).toHaveBeenCalledWith(
        toUpdateUserId,
        updateInputUsername,
      );
      expect(mockRepository.updateUser).toHaveBeenCalledTimes(1);

      const { password, ...other } = updatedUserDto;
      expect(result).toStrictEqual(other);
    });

    it('should update user based on correct input (do not check username if not being updated)', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      const result = await service.update(toUpdateUserId, updateInputPassword);

      expect(mockRepository.getUserById).toHaveBeenCalledWith(toUpdateUserId);
      expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(0);
      expect(mockRepository.updateUser).toHaveBeenCalledWith(
        toUpdateUserId,
        updateInputPassword,
      );
      expect(mockRepository.updateUser).toHaveBeenCalledTimes(1);

      const { password, ...other } = updatedUserDto;
      expect(result).toStrictEqual(other);
    });

    it('should throw BadRequestException if no fields to update are given', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      try {
        await service.update(toUpdateUserId, {});
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(0);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(0);
        expect(mockRepository.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it("should throw BadRequestException if user doesn't exist", async () => {
      mockRepository.getUserById = jest.fn().mockResolvedValueOnce(null);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      try {
        await service.update(toUpdateUserId, updateInputUsername);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(toUpdateUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          updateInputUsername.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if roles are not unique', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.getUserByUsername = jest.fn().mockResolvedValueOnce(null);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      try {
        await service.update(toUpdateUserId, {
          ...updateInputUsername,
          roles: [{ roleId: 'test' }, { roleId: 'test2' }, { roleId: 'test' }],
        });
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(0);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(0);
        expect(mockRepository.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException if username is already being used', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.getUserByUsername = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      try {
        await service.update(toUpdateUserId, updateInputUsername);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(toUpdateUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          updateInputUsername.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getUserById = jest.fn().mockRejectedValueOnce(new Error());
      mockRepository.getUserByUsername = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);
      mockRepository.updateUser = jest
        .fn()
        .mockResolvedValueOnce(updatedUserDto);

      try {
        await service.update(toUpdateUserId, updateInputUsername);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(toUpdateUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getUserByUsername).toHaveBeenCalledWith(
          updateInputUsername.username,
        );
        expect(mockRepository.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });

  describe('delete', () => {
    const toDeleteUserId = 'someUserId';
    const deletedUserDto: UserDto = {
      id: 'autogenerated-id',
      email: 'test@test.com',
      joinedDate: new Date().toISOString(),
      username: 'Delete Test',
      password: 'hashed-password',
      roles: [
        {
          id: 'test-role-id',
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
        },
      ],
    };

    it('should delete user if it exists', async () => {
      mockRepository.getUserById = jest
        .fn()
        .mockResolvedValueOnce(deletedUserDto);
      mockRepository.deleteUser = jest
        .fn()
        .mockResolvedValueOnce(deletedUserDto);

      const result = await service.delete(toDeleteUserId);

      expect(mockRepository.getUserById).toHaveBeenCalledWith(toDeleteUserId);
      expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(mockRepository.deleteUser).toHaveBeenCalledWith(toDeleteUserId);
      expect(mockRepository.deleteUser).toHaveBeenCalledTimes(1);

      const { password, ...other } = deletedUserDto;
      expect(result).toStrictEqual(other);
    });

    it("should throw BadRequestException if user doesn't exist", async () => {
      mockRepository.getUserById = jest.fn().mockResolvedValueOnce(null);
      mockRepository.deleteUser = jest
        .fn()
        .mockResolvedValueOnce(deletedUserDto);

      try {
        await service.delete(toDeleteUserId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(toDeleteUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(mockRepository.deleteUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw InternalError if dependency throws', async () => {
      mockRepository.getUserById = jest.fn().mockRejectedValueOnce(new Error());
      mockRepository.deleteUser = jest
        .fn()
        .mockResolvedValueOnce(deletedUserDto);

      try {
        await service.delete(toDeleteUserId);
        // Fail test if this doesn't throw
        expect(true).toBe(false);
      } catch (error) {
        expect(mockRepository.getUserById).toHaveBeenCalledWith(toDeleteUserId);
        expect(mockRepository.getUserById).toHaveBeenCalledTimes(1);
        expect(mockRepository.deleteUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(InternalError);
      }
    });
  });
});
