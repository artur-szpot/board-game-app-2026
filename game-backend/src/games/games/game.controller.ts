import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
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
  public getById(@Param('id') id: string): Promise<GameDto> {
    return this.gameGateway.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create game' })
  @ApiBody({ type: CreateGameDto })
  @ApiOkResponse({ type: GameDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public create(@Body() input: CreateGameDto): Promise<GameDto> {
    return this.gameGateway.create(input);
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
  ): Promise<GameDto> {
    return this.gameGateway.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete game by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public delete(@Param('id') id: string): Promise<GameDto> {
    return this.gameGateway.delete(id);
  }
}
