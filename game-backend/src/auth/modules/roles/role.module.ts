import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { ROLE_GATEWAY } from './infrastructure/role.gateway';
import { RoleService } from './infrastructure/role.service';
import { RoleController } from './role.controller';

const roleGatewayProvider = {
  provide: ROLE_GATEWAY,
  useClass: RoleService,
};

@Module({
  imports: [DbModule],
  providers: [roleGatewayProvider],
  controllers: [RoleController],
})
export class RoleModule {}
