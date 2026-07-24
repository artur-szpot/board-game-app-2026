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

import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';

import { CreateGameDto } from './dto/in/create-game.dto';
import { UpdateGameDto } from './dto/in/update-game.dto';
import { GameGateway, GAME_GATEWAY } from './infrastructure/game.gateway';

@Controller('game-api/games')
export class GameController {
  constructor(
    @Inject(GAME_GATEWAY)
    private readonly gameGateway: GameGateway,
  ) {}

  @Get(':id')
  public getById(@Param('id') id: string) {
    return this.gameGateway.getById(id);
  }

  @Get()
  public getMany(@Query() pagination: PaginationDto) {
    return this.gameGateway.getMany({
      pagination: paginationMapper.fromDto(pagination),
    });
  }

  @Post()
  public create(@Body() input: CreateGameDto) {
    return this.gameGateway.create(input);
  }

  @Patch(':id')
  public update(@Param('id') id: string, @Body() input: UpdateGameDto) {
    return this.gameGateway.update(id, input);
  }

  @Delete(':id')
  public delete(@Param('id') id: string) {
    return this.gameGateway.delete(id);
  }
}
