import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { PERMISSION_GATEWAY } from './infrastructure/permission.gateway';
import { PermissionService } from './infrastructure/permission.service';
import { PermissionController } from './permission.controller';

const permissionGatewayProvider = {
  provide: PERMISSION_GATEWAY,
  useClass: PermissionService,
};

@Module({
  imports: [DbModule],
  controllers: [PermissionController],
  providers: [permissionGatewayProvider],
})
export class PermissionModule {}
