import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { InternalError, NotFoundError } from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@db/repositories/user.repository';

import { CreateUserDto } from '../dto/in/create-user.dto';
import { UpdateUserDto } from '../dto/in/update-user.dto';
import { UserResponse } from '../dto/out/user.response';
import { userMapper } from '../mappers/user.mapper';
import { UserGateway } from './user.gateway';

@Injectable()
export class UserService implements UserGateway {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  public async getById(userId: string): Promise<UserResponse> {
    try {
      const userDto = await this.userRepository.getUserById(userId);
      if (!userDto) {
        this.logger.error(`Could not find user with ID "${userId}"`);
        throw new NotFoundError(`user with ID "${userId}"`);
      }
      const user = userMapper.fromDto.toDomain(userDto);
      return userMapper.fromDomain.toResponse(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving user with ID "${userId}": ${error}`,
      );
      throw new InternalError('retrieving the user');
    }
  }

  public async getMany(
    pagination?: Pagination,
  ): Promise<Paginated<UserResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.userRepository.getManyUsers(pagination),
        this.userRepository.getAllUsersCount(),
      ]);
      const users = items.map(userMapper.fromDto.toDomain);
      return {
        page: users.map(userMapper.fromDomain.toResponse),
        total,
      };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving users: ${error}`);
      throw new InternalError('retrieving users');
    }
  }

  private ensureUniqueRoles(
    input: Partial<Pick<CreateUserDto, 'roles'>> | Pick<UpdateUserDto, 'roles'>,
  ): void {
    const { roles } = input;
    if (!roles || roles.length === 1) {
      return;
    }
    const duplicateRoles = new Set();
    const roleSet = new Set();
    roles.forEach(({ roleId }) => {
      if (roleSet.has(roleId)) {
        duplicateRoles.add(roleId);
      }
      roleSet.add(roleId);
    });
    if (!duplicateRoles.size) {
      return;
    }
    throw new BadRequestException(
      `Duplicate roles provided for the user: ${[...duplicateRoles].map((role) => `"${role}"`).join(', ')}`,
    );
  }

  private async ensureUniqueEmail(email: string): Promise<void> {
    if ((await this.userRepository.getUserByEmail(email)) !== null) {
      throw new BadRequestException(
        `User with e-mail "${email}" already exists`,
      );
    }
  }

  private async ensureUniqueUsername(username?: string): Promise<void> {
    if (!username) {
      return;
    }
    if ((await this.userRepository.getUserByUsername(username)) !== null) {
      throw new BadRequestException(
        `User with username "${username}" already exists`,
      );
    }
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const existingUser = await this.userRepository.getUserById(userId);
    if (existingUser === null) {
      throw new BadRequestException(`User with ID "${userId}" doesn\'t exist`);
    }
  }

  public async create(input: CreateUserDto): Promise<UserResponse> {
    this.ensureUniqueRoles(input);

    try {
      await Promise.all([
        this.ensureUniqueEmail(input.email),
        this.ensureUniqueUsername(input.username),
      ]);

      const userDto = await this.userRepository.createUser(input);
      const user = userMapper.fromDto.toDomain(userDto);
      return userMapper.fromDomain.toResponse(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating user: ${error}`);
      throw new InternalError('creating the user');
    }
  }

  public async update(
    userId: string,
    input: UpdateUserDto,
  ): Promise<UserResponse> {
    validateUpdateDtoNotEmpty(input);
    this.ensureUniqueRoles(input);

    try {
      await Promise.all([
        this.ensureUserExists(userId),
        this.ensureUniqueUsername(input.username),
      ]);

      const userDto = await this.userRepository.updateUser(userId, input);
      const user = userMapper.fromDto.toDomain(userDto);
      return userMapper.fromDomain.toResponse(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating user: ${error}`);
      throw new InternalError('updating the user');
    }
  }

  public async delete(userId: string): Promise<UserResponse> {
    try {
      await this.ensureUserExists(userId);

      const userDto = await this.userRepository.deleteUser(userId);
      const user = userMapper.fromDto.toDomain(userDto);
      return userMapper.fromDomain.toResponse(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting user: ${error}`);
      throw new InternalError('deleting the user');
    }
  }
}
