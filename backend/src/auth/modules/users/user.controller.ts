import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import { Paginated } from '@common/pagination/Paginated';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';
import { CreateUserDto } from './dto/in/create-user.dto';
import { UpdateUserDto } from './dto/in/update-user.dto';
import { UserResponse } from './dto/out/user.response';
import { USER_GATEWAY, UserGateway } from './infrastructure/user.gateway';
import { UserId } from '@common/decorators/user-id.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class UserController {
  constructor(
    @Inject(USER_GATEWAY)
    private readonly gateway: UserGateway,
  ) {}

  @Get('/me')
  public async getLoggedInUser(
    @UserId() userId: string,
  ): Promise<UserResponse> {
    return this.gateway.getById(userId);
  }

  @Get('/:id')
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async getUserById(
    @Param() params: GetEntityByIdDto,
  ): Promise<UserResponse> {
    return this.gateway.getById(params.id);
  }

  @Get()
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async getUsers(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<UserResponse>> {
    return this.gateway.getMany(paginationMapper.fromDto(pagination));
  }

  @Post()
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.CREATE],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async createUser(@Body() body: CreateUserDto): Promise<UserResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.FULL],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async updateUser(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.FULL],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async deleteUser(
    @Param() params: GetEntityByIdDto,
  ): Promise<UserResponse> {
    return this.gateway.delete(params.id);
  }
}
