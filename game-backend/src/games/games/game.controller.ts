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
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateGameDto } from './dto/in/create-game.dto';
import { GameDto } from './dto/in/game.dto';
import { UpdateGameDto } from './dto/in/update-game.dto';
import { GAME_GATEWAY, GameGateway } from './infrastructure/game.gateway';

@ApiTags('Games')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/games')
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
  public getById(@Param('id') id: string): Promise<GameDto> {
    return this.gameGateway.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create game' })
  @ApiBody({ type: CreateGameDto })
  @ApiOkResponse({ type: GameDto })
  public create(@Body() input: CreateGameDto): Promise<GameDto> {
    return this.gameGateway.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update game by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateGameDto })
  @ApiOkResponse({ type: GameDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
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
  public delete(@Param('id') id: string): Promise<GameDto> {
    return this.gameGateway.delete(id);
  }
}
