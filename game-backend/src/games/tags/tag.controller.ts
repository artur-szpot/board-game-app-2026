import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
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
import { JwtDto } from '@auth/dto/in/jwt.dto';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { hasCollectionSuperuserPermission } from '@auth/helpers/has-collection-superuser-permission';
import { hasSystemCollectionFullPermission } from '@auth/helpers/has-system-collection-full-permission';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { UserId } from '@common/decorators/user-id.decorator';
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
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<TagResponse> {
    return this.gateway.getById(params.id, {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async createTag(
    @Body() body: CreateTagDto,
    @UserId() userId: string,
  ): Promise<TagResponse> {
    return this.gateway.create(body, userId);
  }

  @Post('/system')
  @ApiOperation({ summary: 'Create a SYSTEM-owned tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagResponse })
  @RequirePermissions([PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL])
  public async createSystemTag(
    @Body() body: CreateTagDto,
  ): Promise<TagResponse> {
    return this.gateway.createSystem(body);
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
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<TagResponse> {
    return this.gateway.update(params.id, body, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }

  @Patch('/:id/system')
  @ApiOperation({ summary: 'Make tag SYSTEM-owned' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL])
  public async makeSystemOwnedTag(
    @Param() params: GetEntityByIdDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<TagResponse> {
    return this.gateway.makeSystemOwned(params.id, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async deleteTag(
    @Param() params: GetEntityByIdDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<TagResponse> {
    return this.gateway.delete(params.id, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }
}
