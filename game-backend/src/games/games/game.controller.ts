import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtDto } from '@auth/dto/in/jwt.dto';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { hasCollectionSuperuserPermission } from '@auth/helpers/has-collection-superuser-permission';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { UserId } from '@common/decorators/user-id.decorator';
import {
  CustomNotFoundError,
  CustomBadRequestError,
} from '@common/errors/service-errors';
import { SET_GATEWAY, SetGateway } from '../sets/infrastructure/set.gateway';
import { GameHelperResponse } from './dto/out/game-helper.response';
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
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

import { CreateGameDto } from './dto/in/create-game.dto';
import { GameDto } from './dto/in/game.dto';
import { UpdateGameDto } from './dto/in/update-game.dto';
import { GAME_GATEWAY, GameGateway } from './infrastructure/game.gateway';

@ApiTags('Games')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/games')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class GameController {
  constructor(
    @Inject(GAME_GATEWAY)
    private readonly gameGateway: GameGateway,
    @Inject(SET_GATEWAY)
    private readonly setGateway: SetGateway,
  ) {}

  @Get(':id/helpers/:helperId')
  @ApiOperation({
    summary:
      'Load an assigned helper and its data sets for running from a visible game',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'helperId', type: String })
  @ApiOkResponse({ type: GameHelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public async getAssignedHelper(
    @Param('id') id: string,
    @Param('helperId') helperId: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<GameHelperResponse> {
    const ownership = {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    };
    const game = await this.gameGateway.getById(id, ownership);
    const helper = game.helpers.find((item) => item.id === helperId);
    if (!helper) {
      throw new CustomNotFoundError('helper assigned to this game');
    }
    if (
      !('sets' in helper.logic) ||
      typeof helper.logic.sets !== 'object' ||
      helper.logic.sets === null ||
      Array.isArray(helper.logic.sets)
    ) {
      throw new CustomBadRequestError(
        'Assigned helper has invalid set references',
      );
    }
    const ids = [...new Set(Object.values(helper.logic.sets))];
    if (
      !ids.every((value: unknown): value is string => typeof value === 'string')
    ) {
      throw new CustomBadRequestError(
        'Assigned helper has invalid set references',
      );
    }
    const sets = ids.length
      ? await this.setGateway.getByIds(ids, ownership)
      : [];
    if (sets.length !== ids.length) {
      throw new CustomNotFoundError(
        'data sets referenced by the assigned helper',
      );
    }
    return { helper, sets };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public getById(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<GameDto> {
    return this.gameGateway.getById(id, {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create game' })
  @ApiBody({ type: CreateGameDto })
  @ApiOkResponse({ type: GameDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public create(
    @Body() input: CreateGameDto,
    @UserId() userId: string,
  ): Promise<GameDto> {
    return this.gameGateway.create(input, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update game by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateGameDto })
  @ApiOkResponse({ type: GameDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public update(
    @Param('id') id: string,
    @Body() input: UpdateGameDto,
    @UserId() userId: string,
  ): Promise<GameDto> {
    return this.gameGateway.update(id, input, {
      userId,
      hasCollectionSuperuserPermission: false,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete game by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public delete(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<GameDto> {
    return this.gameGateway.delete(id, {
      userId,
      hasCollectionSuperuserPermission: false,
    });
  }
}
