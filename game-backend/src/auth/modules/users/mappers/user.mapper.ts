import { Logger } from '@nestjs/common';

import { roleMapper } from '@auth/modules/roles/mappers/role.mapper';

import { User } from '../domain/User';
import { UserDto } from '../dto/in/user.dto';
import { UserResponse } from '../dto/out/user.response';

const logger = new Logger('UserMapper');

export const userMapper = {
  fromDto: {
    toDomain: (dto: UserDto): User => {
      return new User(logger, {
        id: dto.id,
        email: dto.email,
        username: dto.username,
        password: dto.password,
        roles: dto.roles,
        joinedDate: `${dto.joinedDate}`,
        lastLogin: dto.lastLogin,
      });
    },
  },
  fromDomain: {
    toResponse: (user: User): UserResponse => {
      const { id, email, username, roles, joinedDate, lastLogin } =
        user.getProps();
      return {
        id,
        email,
        username,
        roles: roles.map(roleMapper.fromDomain.toResponse),
        joinedDate: joinedDate.toISOString(),
        ...(lastLogin ? { lastLogin: lastLogin.toISOString() } : {}),
      };
    },
  },
};
