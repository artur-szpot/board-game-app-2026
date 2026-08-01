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
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/game-scores')
export class GameScoreController {
  constructor(
    @Inject(GAME_SCORE_GATEWAY) private readonly gateway: GameScoreGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get game score by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GameScoreResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create game score' })
  @ApiBody({ type: CreateGameScoreDto })
  @ApiOkResponse({ type: GameScoreResponse })
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
  public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.delete(params.id);
  }
}
