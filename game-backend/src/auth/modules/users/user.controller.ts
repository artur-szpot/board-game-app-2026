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

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { UserId } from '@common/decorators/user-id.decorator';
import { PermissionLevel } from '../permissions/enums/permission-level.enum';
import { PermissionType } from '../permissions/enums/permission-type.enum';
import { CreateUserDto } from './dto/in/create-user.dto';
import { UpdateUserDto } from './dto/in/update-user.dto';
import { MeResponse } from './dto/out/me.response';
import { UserResponse } from './dto/out/user.response';
import { USER_GATEWAY, UserGateway } from './infrastructure/user.gateway';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@Controller('users')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class UserController {
  constructor(
    @Inject(USER_GATEWAY)
    private readonly gateway: UserGateway,
  ) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: MeResponse })
  public async getLoggedInUser(@UserId() userId: string): Promise<MeResponse> {
    return this.gateway.getMe(userId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async getUserById(
    @Param() params: GetEntityByIdDto,
  ): Promise<UserResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: UserResponse })
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.READ],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async createUser(@Body() body: CreateUserDto): Promise<UserResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.FULL],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async updateUser(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  @RequirePermissions(
    [PermissionType.USERS, PermissionLevel.FULL],
    [PermissionType.ROLES, PermissionLevel.READ],
    [PermissionType.PERMISSIONS, PermissionLevel.READ],
  )
  public async deleteUser(
    @Param() params: GetEntityByIdDto,
  ): Promise<UserResponse> {
    return this.gateway.delete(params.id);
  }
}
