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
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { UserId } from '@common/decorators/user-id.decorator';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { CreateLocationDto } from './dto/in/create-location.dto';
import { UpdateLocationDto } from './dto/in/update-location.dto';
import { LocationResponse } from './dto/out/location.response';
import {
    LOCATION_GATEWAY,
    LocationGateway,
} from './infrastructure/location.gateway';

@ApiTags('Locations')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('game-api/locations')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class LocationController {
  constructor(
    @Inject(LOCATION_GATEWAY)
    private readonly gateway: LocationGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.READ])
  public async getLocationById(
    @Param() params: GetEntityByIdDto,
    @UserId() userId: string,
    @Req() req: { user: JwtDto },
  ): Promise<LocationResponse> {
    return this.gateway.getById(
      params.id,
      userId,
      hasCollectionSuperuserPermission(req.user.permissions),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiOkResponse({ type: LocationResponse })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async createLocation(
    @Body() body: CreateLocationDto,
    @UserId() userId: string,
  ): Promise<LocationResponse> {
    return this.gateway.create(body, userId);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateLocationDto })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async updateLocation(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateLocationDto,
    @UserId() userId: string,
  ): Promise<LocationResponse> {
    return this.gateway.update(params.id, body, userId);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions([PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL])
  public async deleteLocation(
    @Param() params: GetEntityByIdDto,
    @UserId() userId: string,
  ): Promise<LocationResponse> {
    return this.gateway.delete(params.id, userId);
  }
}
