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

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import { Paginated } from '@common/pagination/Paginated';

import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';
import { CreateRoleDto } from './dto/in/create-role.dto';
import { GetRoleByNameDto } from './dto/in/get-role-by-name.dto';
import { UpdateRoleDto } from './dto/in/update-role.dto';
import { RoleResponse } from './dto/out/role.response';
import { ROLE_GATEWAY, RoleGateway } from './infrastructure/role.gateway';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class RoleController {
  constructor(
    @Inject(ROLE_GATEWAY)
    private readonly gateway: RoleGateway,
  ) {}

  @Get('/:id')
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async getRoleById(@Param() params: GetEntityByIdDto): Promise<RoleResponse> {
    return this.gateway.getById(params.id);
  }

  @Get('/name/:name')
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async getRoleByName(
    @Param() params: GetRoleByNameDto,
  ): Promise<RoleResponse> {
    return this.gateway.getByName(params.name);
  }

  @Get()
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async getRoles(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<RoleResponse>> {
    return this.gateway.getMany(paginationMapper.fromDto(pagination));
  }

  @Post()
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.CREATE],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async createRole(@Body() body: CreateRoleDto): Promise<RoleResponse> {
    console.log(JSON.stringify(body));
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.FULL],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async updateRole(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateRoleDto,
  ): Promise<RoleResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.FULL],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async deleteRole(@Param() params: GetEntityByIdDto): Promise<RoleResponse> {
    return this.gateway.delete(params.id);
  }
}
