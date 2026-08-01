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

import { CreateTagDto } from './dto/in/create-tag.dto';
import { UpdateTagDto } from './dto/in/update-tag.dto';
import { TagResponse } from './dto/out/tag.response';
import { TAG_GATEWAY, TagGateway } from './infrastructure/tag.gateway';

@ApiTags('Tags')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/tags')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class TagController {
  constructor(
    @Inject(TAG_GATEWAY)
    private readonly gateway: TagGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public async getTagById(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async createTag(@Body() body: CreateTagDto): Promise<TagResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async updateTag(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateTagDto,
  ): Promise<TagResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async deleteTag(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.delete(params.id);
  }
}
