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
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { CreateGameScoreDto } from './dto/in/create-game-score.dto';
import { UpdateGameScoreDto } from './dto/in/update-game-score.dto';
import { GameScoreResponse } from './dto/out/game-score.response';
import { GAME_SCORE_GATEWAY, GameScoreGateway } from './game-score.gateway';

@ApiTags('GameScores')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/game-scores')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class GameScoreController {
  constructor(
    @Inject(GAME_SCORE_GATEWAY) private readonly gateway: GameScoreGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get game score by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameScoreResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create game score' })
  @ApiBody({ type: CreateGameScoreDto })
  @ApiOkResponse({ type: GameScoreResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async create(
    @Body() body: CreateGameScoreDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update game score by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateGameScoreDto })
  @ApiOkResponse({ type: GameScoreResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async update(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateGameScoreDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete game score by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameScoreResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.delete(params.id);
  }
}
