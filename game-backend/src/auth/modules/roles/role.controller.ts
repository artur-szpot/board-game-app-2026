import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';
import { CreateRoleDto } from './dto/in/create-role.dto';
import { GetRoleByNameDto } from './dto/in/get-role-by-name.dto';
import { UpdateRoleDto } from './dto/in/update-role.dto';
import { RoleResponse } from './dto/out/role.response';
import { ROLE_GATEWAY, RoleGateway } from './infrastructure/role.gateway';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('roles')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class RoleController {
  constructor(
    @Inject(ROLE_GATEWAY)
    private readonly gateway: RoleGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RoleResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async getRoleById(@Param() params: GetEntityByIdDto): Promise<RoleResponse> {
    return this.gateway.getById(params.id);
  }

  @Get('/name/:name')
  @ApiOperation({ summary: 'Get role by name' })
  @ApiParam({ name: 'name', type: String })
  @ApiOkResponse({ type: RoleResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async getRoleByName(
    @Param() params: GetRoleByNameDto,
  ): Promise<RoleResponse> {
    return this.gateway.getByName(params.name);
  }

  @Post()
  @ApiOperation({ summary: 'Create a role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiOkResponse({ type: RoleResponse })
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async createRole(@Body() body: CreateRoleDto): Promise<RoleResponse> {
    console.log(JSON.stringify(body));
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ type: RoleResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
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
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RoleResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.ROLES, PermissionLevel.FULL],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  async deleteRole(@Param() params: GetEntityByIdDto): Promise<RoleResponse> {
    return this.gateway.delete(params.id);
  }
}
