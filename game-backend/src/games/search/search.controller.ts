import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
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
  public search(@Body() query: SearchQueryDto): Promise<SearchResponse> {
    return this.searchGateway.search(query);
  }
}
