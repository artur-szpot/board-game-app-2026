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
  ) {}

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
