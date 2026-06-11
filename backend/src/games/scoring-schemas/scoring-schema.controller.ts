import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import { Paginated } from '@common/pagination/Paginated';

import { SCORING_SCHEMA_GATEWAY, ScoringSchemaGateway } from './infrastructure/scoring-schema.gateway';
import { CreateScoringSchemaDto } from './dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from './dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from './dto/out/scoring-schema.response';

@Controller('game-api/scoring-schemas')
export class ScoringSchemaController {
  constructor(
    @Inject(SCORING_SCHEMA_GATEWAY)
    private readonly gateway: ScoringSchemaGateway,
  ) {}

  @Get('/:id')
  public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.getById(params.id);
  }

  @Get()
  public async getMany(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<ScoringSchemaResponse>> {
    return this.gateway.getMany(paginationMapper.fromDto(pagination));
  }

  @Post()
  public async create(
    @Body() body: CreateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  public async update(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.delete(params.id);
  }
}
