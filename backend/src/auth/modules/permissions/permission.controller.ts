import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { Paginated } from '@common/pagination/Paginated';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';

import { GetPermissionByTypeDto } from './dto/in/get-permission-by-type.dto';
import { PermissionResponse } from './dto/out/permission.response';
import { PermissionLevel } from './enums/permission-level.enum';
import { PermissionType } from './enums/permission-type.enum';
import {
  PERMISSION_GATEWAY,
  PermissionGateway,
} from './infrastructure/permission.gateway';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class PermissionController {
  constructor(
    @Inject(PERMISSION_GATEWAY)
    private readonly gateway: PermissionGateway,
  ) {}

  @Get('/:permissionType')
  @RequirePermissions([PermissionType.PERMISSIONS, PermissionLevel.READ])
  async getPermissionByType(
    @Param() params: GetPermissionByTypeDto,
  ): Promise<PermissionResponse> {
    const { permissionType } = params;
    return this.gateway.getByType(permissionType);
  }

  @Get('/')
  @RequirePermissions([PermissionType.PERMISSIONS, PermissionLevel.READ])
  async getPermissions(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<PermissionResponse>> {
    return this.gateway.getMany(paginationMapper.fromDto(pagination));
  }
}
