import { Module } from '@nestjs/common';

import { PostgresConnector } from './connectors/postgres/PostgresConnector';
import { PostgresPermissionRepository } from './connectors/postgres/permission.pg-repository';
import { PostgresRoleRepository } from './connectors/postgres/role.pg-repository';
import { PostgresUserRepository } from './connectors/postgres/user.pg-repository';
import { PERMISSION_REPOSITORY } from './repositories/permission.repository';
import { ROLE_REPOSITORY } from './repositories/role.repository';
import { USER_REPOSITORY } from './repositories/user.repository';

const userProvider = {
  provide: USER_REPOSITORY,
  useClass: PostgresUserRepository,
};
const roleProvider = {
  provide: ROLE_REPOSITORY,
  useClass: PostgresRoleRepository,
};
const permissionProvider = {
  provide: PERMISSION_REPOSITORY,
  useClass: PostgresPermissionRepository,
};

@Module({
  providers: [
    PostgresConnector,
    userProvider,
    roleProvider,
    permissionProvider,
  ],
  exports: [userProvider, roleProvider, permissionProvider],
})
export class DbModule {}
