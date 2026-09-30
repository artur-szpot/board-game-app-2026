import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtDto } from '@auth/dto/in/jwt.dto';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { hasCollectionSuperuserPermission } from '@auth/helpers/has-collection-superuser-permission';
import { hasSystemCollectionFullPermission } from '@auth/helpers/has-system-collection-full-permission';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { UserId } from '@common/decorators/user-id.decorator';
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
    Post,
    Put,
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

import { CreateSetDto } from './dto/in/create-set.dto';
import { UpdateSetDto } from './dto/in/update-set.dto';
import { SetResponse } from './dto/out/set.response';
import { SET_GATEWAY, SetGateway } from './infrastructure/set.gateway';

@ApiTags('Sets')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/sets')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class SetController {
  constructor(
    @Inject(SET_GATEWAY)
    private readonly setGateway: SetGateway,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get set by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: SetResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  getById(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<SetResponse> {
    return this.setGateway.getById(id, {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create set' })
  @ApiBody({ type: CreateSetDto })
  @ApiOkResponse({ type: SetResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  create(
    @Body() input: CreateSetDto,
    @UserId() userId: string,
  ): Promise<SetResponse> {
    return this.setGateway.create(input, userId);
  }

  @Post('/system')
  @ApiOperation({ summary: 'Create a SYSTEM-owned set' })
  @ApiBody({ type: CreateSetDto })
  @ApiOkResponse({ type: SetResponse })
  @RequirePermissions([PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL])
  createSystem(@Body() input: CreateSetDto): Promise<SetResponse> {
    return this.setGateway.createSystem(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update set by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSetDto })
  @ApiOkResponse({ type: SetResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  update(
    @Param('id') id: string,
    @Body() input: UpdateSetDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<SetResponse> {
    return this.setGateway.update(id, input, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete set by ID; fails while helpers use it' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: SetResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  delete(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<SetResponse> {
    return this.setGateway.delete(id, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }
}
