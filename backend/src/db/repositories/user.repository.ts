import { CreateUserDto } from '@auth/modules/users/dto/in/create-user.dto';
import { UpdateUserDto } from '@auth/modules/users/dto/in/update-user.dto';
import { UserDto } from '@auth/modules/users/dto/in/user.dto';
import { Pagination } from '@common/pagination/pagination';

export interface UserRepository {
  getUserById(userId: string): Promise<UserDto | null>;
  getUserByEmail(email: string): Promise<UserDto | null>;
  getUserByUsername(username: string): Promise<UserDto | null>;
  getManyUsers(pagination?: Pagination): Promise<UserDto[]>;
  getAllUsersCount(): Promise<number>;
  createUser(input: CreateUserDto): Promise<UserDto>;
  updateUser(userId: string, input: UpdateUserDto): Promise<UserDto>;
  deleteUser(userId: string): Promise<UserDto>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
