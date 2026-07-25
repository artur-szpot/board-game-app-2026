import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';

import { AuthSearchQueryDto } from './dto/in/auth-search-query.dto';
import { AuthSearchResponse } from './dto/out/auth-search.response';
import {
  AUTH_SEARCH_GATEWAY,
  AuthSearchGateway,
} from './infrastructure/auth-search.gateway';

@Controller('admin/search')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class AuthSearchController {
  constructor(
    @Inject(AUTH_SEARCH_GATEWAY)
    private readonly authSearchGateway: AuthSearchGateway,
  ) {}

  // TODO: check these permissions granularly
  @Post()
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public search(@Body() query: AuthSearchQueryDto): Promise<AuthSearchResponse> {
    return this.authSearchGateway.search(query);
  }
}
