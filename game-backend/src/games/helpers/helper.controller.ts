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

import { CreateHelperDto } from './dto/in/create-helper.dto';
import { UpdateHelperDto } from './dto/in/update-helper.dto';
import { HelperResponse } from './dto/out/helper.response';
import { HELPER_GATEWAY, HelperGateway } from './infrastructure/helper.gateway';

@ApiTags('Helpers')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/helpers')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class HelperController {
  constructor(
    @Inject(HELPER_GATEWAY)
    private readonly helperGateway: HelperGateway,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  getById(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<HelperResponse> {
    return this.helperGateway.getById(id, {
      userId,
      hasCollectionSuperuserPermission: hasCollectionSuperuserPermission(
        req.user.permissions,
      ),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create helper' })
  @ApiBody({ type: CreateHelperDto })
  @ApiOkResponse({ type: HelperResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  create(
    @Body() input: CreateHelperDto,
    @UserId() userId: string,
  ): Promise<HelperResponse> {
    return this.helperGateway.create(input, userId);
  }

  @Post('/system')
  @ApiOperation({ summary: 'Create a SYSTEM-owned helper' })
  @ApiBody({ type: CreateHelperDto })
  @ApiOkResponse({ type: HelperResponse })
  @RequirePermissions([PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL])
  createSystem(@Body() input: CreateHelperDto): Promise<HelperResponse> {
    return this.helperGateway.createSystem(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateHelperDto })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  update(
    @Param('id') id: string,
    @Body() input: UpdateHelperDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<HelperResponse> {
    return this.helperGateway.update(id, input, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  delete(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<HelperResponse> {
    return this.helperGateway.delete(id, {
      userId,
      hasCollectionSuperuserPermission: false,
      hasSystemCollectionFullPermission: hasSystemCollectionFullPermission(
        req.user.permissions,
      ),
    });
  }
}
