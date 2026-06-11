import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDto } from '@auth/modules/users/dto/in/user.dto';
import { RoleRepository } from '@db/repositories/role.repository';
import { UserRepository } from '@db/repositories/user.repository';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { LoginDto } from '../dto/in/login.dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const mockJwtService = jest.requireMock(
    '@nestjs/jwt',
  ) as jest.Mocked<JwtService>;
  const mockUsersRepository = jest.requireMock(
    '@db/repositories/user.repository',
  ) as jest.Mocked<UserRepository>;
  const mockRolesRepository = jest.requireMock(
    '@db/repositories/role.repository',
  ) as jest.Mocked<RoleRepository>;
  const service = new AuthService(
    mockJwtService,
    mockUsersRepository,
    mockRolesRepository,
  );

  const loginDto: LoginDto = {
    email: 'test',
    password: 'secret',
  };
  const wrongLoginDto: LoginDto = {
    email: 'test',
    password: 'wrong',
  };
  const userDto: UserDto = {
    id: '1',
    email: 'test@test.com',
    username: 'Test User',
    joinedDate: '2025-09-18T19:56:17.000Z',
    password: bcrypt.hashSync('secret', 10),
    roles: [
      {
        id: '1',
        description: 'text',
        name: 'test role',
        protectedRole: true,
        permissions: [
          {
            description: 'text',
            permissionType: PermissionType.PERMISSIONS,
            permissionLevel: PermissionLevel.FULL,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockJwtService.sign = jest.fn().mockReturnValueOnce('token');
  });

  it('should log in an existing user', async () => {
    mockUsersRepository.getUserByEmail = jest
      .fn()
      .mockResolvedValueOnce(userDto);

    const result = await service.login(loginDto);

    expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(
      loginDto.email,
    );
    expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({ accessToken: 'token' });
  });

  it('should return generic error if wrong password given', async () => {
    mockUsersRepository.getUserByEmail = jest
      .fn()
      .mockResolvedValueOnce(userDto);

    try {
      await service.login(wrongLoginDto);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).message).toEqual(
        'Invalid login credentials.',
      );
    }
  });

  it("should return generic error if user doesn't exist", async () => {
    mockUsersRepository.getUserByEmail = jest.fn().mockResolvedValueOnce(null);

    try {
      await service.login(loginDto);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).message).toEqual(
        'Invalid login credentials.',
      );
    }
  });

  it('should return generic error if dependent class fails', async () => {
    mockUsersRepository.getUserByEmail = jest
      .fn()
      .mockRejectedValueOnce(new Error("table users doesn't exist"));

    try {
      await service.login(loginDto);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect((error as InternalServerErrorException).message).toEqual(
        'Unexpected error occurred while signing in',
      );
    }
  });
});
