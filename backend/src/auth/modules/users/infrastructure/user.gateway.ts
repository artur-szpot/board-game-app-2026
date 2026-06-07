import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateUserDto } from '../dto/in/create-user.dto';
import { UpdateUserDto } from '../dto/in/update-user.dto';
import { MeResponse } from '../dto/out/me.response';
import { UserResponse } from '../dto/out/user.response';

export interface UserGateway {
  getById(userId: string): Promise<UserResponse>;
  getMe(userId: string): Promise<MeResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<UserResponse>>;
  create(input: CreateUserDto): Promise<UserResponse>;
  update(userId: string, input: UpdateUserDto): Promise<UserResponse>;
  delete(userId: string): Promise<UserResponse>;
}

export const USER_GATEWAY = Symbol('USER_GATEWAY');
