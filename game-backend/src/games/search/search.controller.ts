import { RequirePermissions } from '@auth/decorators/permissions.decorator';
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
  @ApiOperation({ summary: 'Search game domain entities for collection UI' })
  @ApiBody({ type: SearchQueryDto })
  @ApiOkResponse({ type: SearchResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public search(
    @Body() query: SearchQueryDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<SearchResponse> {
    return this.searchGateway.search(
      query,
      userId,
      hasCollectionSuperuserPermission(req.user.permissions),
    );
  }
}
