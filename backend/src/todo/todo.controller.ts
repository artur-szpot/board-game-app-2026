import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';

import { RequirePermissions } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@db/repositories/user.repository';

@Controller('todo')
@UseGuards(JwtAuthGuard, PermisionsGuard)
export class TodoController {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly dbConnector: UserRepository,
  ) {}

  @Get('/:id')
  @RequirePermissions([PermissionType.TODOS, PermissionLevel.READ])
  public async getTodo(@Param('id') id: number): Promise<string> {
    const user = await this.dbConnector.getUserById('123-abc');
    return `This will return todo with ID ${id} (current user: ${user})`;
  }

  // post to create a new one

  // patch to update an existing one

  // get all with pagination or other params

  // delete to remove unwanted one
}
