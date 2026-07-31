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

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';

import {
  SCORING_SCHEMA_GATEWAY,
  ScoringSchemaGateway,
} from './infrastructure/scoring-schema.gateway';
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
