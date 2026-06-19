import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import { Paginated } from '@common/pagination/Paginated';

import { GAME_SCORE_GATEWAY, GameScoreGateway } from './game-score.gateway';
import { CreateGameScoreDto } from './dto/in/create-game-score.dto';
import { UpdateGameScoreDto } from './dto/in/update-game-score.dto';
import { GameScoreResponse } from './dto/out/game-score.response';

@Controller('game-api/game-scores')
export class GameScoreController {
  constructor(
    @Inject(GAME_SCORE_GATEWAY) private readonly gateway: GameScoreGateway,
  ) {}

  @Get('/:id') public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.getById(params.id);
  }

  @Get() public async getMany(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<GameScoreResponse>> {
    return this.gateway.getMany(paginationMapper.fromDto(pagination));
  }

  @Post() public async create(
    @Body() body: CreateGameScoreDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id') public async update(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateGameScoreDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id') public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<GameScoreResponse> {
    return this.gateway.delete(params.id);
  }
}
