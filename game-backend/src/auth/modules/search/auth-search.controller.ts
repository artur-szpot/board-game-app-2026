import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
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
import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';

import { AuthSearchQueryDto } from './dto/in/auth-search-query.dto';
import { AuthSearchResponse } from './dto/out/auth-search.response';
import {
    AUTH_SEARCH_GATEWAY,
    AuthSearchGateway,
} from './infrastructure/auth-search.gateway';

@ApiTags('AdminSearch')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('admin/search')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class AuthSearchController {
  constructor(
    @Inject(AUTH_SEARCH_GATEWAY)
    private readonly authSearchGateway: AuthSearchGateway,
  ) {}

  // TODO: check these permissions granularly
  @Post()
  @ApiOperation({
    summary: 'Search users, roles, and permissions for admin UI',
  })
  @ApiBody({ type: AuthSearchQueryDto })
  @ApiOkResponse({ type: AuthSearchResponse })
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public search(
    @Body() query: AuthSearchQueryDto,
  ): Promise<AuthSearchResponse> {
    return this.authSearchGateway.search(query);
  }
}
