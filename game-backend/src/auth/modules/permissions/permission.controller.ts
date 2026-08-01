import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
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
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { GetPermissionByTypeDto } from './dto/in/get-permission-by-type.dto';
import { PermissionResponse } from './dto/out/permission.response';
import { PermissionLevel } from './enums/permission-level.enum';
import { PermissionType } from './enums/permission-type.enum';
import {
    PERMISSION_GATEWAY,
    PermissionGateway,
} from './infrastructure/permission.gateway';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class PermissionController {
  constructor(
    @Inject(PERMISSION_GATEWAY)
    private readonly gateway: PermissionGateway,
  ) {}

  @Get('/:permissionType')
  @ApiOperation({ summary: 'Get permission by permission type' })
  @ApiParam({
    name: 'permissionType',
    enum: PermissionType,
    enumName: 'PermissionType',
  })
  @ApiOkResponse({ type: PermissionResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.PERMISSIONS, PermissionLevel.READ])
  async getPermissionByType(
    @Param() params: GetPermissionByTypeDto,
  ): Promise<PermissionResponse> {
    const { permissionType } = params;
    return this.gateway.getByType(permissionType);
  }
}
