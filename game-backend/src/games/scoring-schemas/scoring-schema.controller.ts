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

import { CreateScoringSchemaDto } from './dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from './dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from './dto/out/scoring-schema.response';
import {
    SCORING_SCHEMA_GATEWAY,
    ScoringSchemaGateway,
} from './infrastructure/scoring-schema.gateway';

@ApiTags('ScoringSchemas')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/scoring-schemas')
export class ScoringSchemaController {
  constructor(
    @Inject(SCORING_SCHEMA_GATEWAY)
    private readonly gateway: ScoringSchemaGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get scoring schema by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ScoringSchemaResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create scoring schema' })
  @ApiBody({ type: CreateScoringSchemaDto })
  @ApiOkResponse({ type: ScoringSchemaResponse })
  public async create(
    @Body() body: CreateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update scoring schema by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateScoringSchemaDto })
  @ApiOkResponse({ type: ScoringSchemaResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async update(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete scoring schema by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ScoringSchemaResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.delete(params.id);
  }
}
