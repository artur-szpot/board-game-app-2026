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

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
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
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/scoring-schemas')
@UseGuards(JwtAuthGuard, PermisionsGuard)
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
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public async getById(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create scoring schema' })
  @ApiBody({ type: CreateScoringSchemaDto })
  @ApiOkResponse({ type: ScoringSchemaResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
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
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
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
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async delete(
    @Param() params: GetEntityByIdDto,
  ): Promise<ScoringSchemaResponse> {
    return this.gateway.delete(params.id);
  }
}
