import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { hasRequiredPermission } from '@auth/helpers/has-required-permission';
import { GameDataType } from '@common/enums/GameDataType.enum';
import { CustomForbiddenError } from '@common/errors/service-errors';
import { JwtDto } from '@auth/dto/in/jwt.dto';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { hasCollectionSuperuserPermission } from '@auth/helpers/has-collection-superuser-permission';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { UserId } from '@common/decorators/user-id.decorator';
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
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

import { SearchQueryDto } from './dto/in/search-query.dto';
import { SearchResponse } from './dto/out/search.response';
import { SEARCH_GATEWAY, SearchGateway } from './infrastructure/search.gateway';

@ApiTags('GameSearch')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/search')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class SearchController {
  constructor(
    @Inject(SEARCH_GATEWAY)
    private readonly searchGateway: SearchGateway,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Search game domain entities for collection UI',
    description:
      'Helpers and sets require DATA_MANAGEMENT READ. Other types require GAME_COLLECTIONS FULL. Each requested type must be authorized.',
  })
  @ApiBody({ type: SearchQueryDto })
  @ApiOkResponse({ type: SearchResponse })
  @RequirePermissions()
  public search(
    @Body() query: SearchQueryDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<SearchResponse> {
    for (const type of query.types) {
      const dataManagement =
        type === GameDataType.HELPER || type === GameDataType.SET;
      const permission = dataManagement
        ? PermissionType.DATA_MANAGEMENT
        : PermissionType.GAME_COLLECTIONS;
      const level = dataManagement
        ? PermissionLevel.READ
        : PermissionLevel.FULL;
      if (!hasRequiredPermission(req.user.permissions, permission, level)) {
        throw new CustomForbiddenError(
          `${permission} ${level} permission is required`,
        );
      }
    }
    return this.searchGateway.search(query, {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    });
  }
}
