import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { USER_GATEWAY } from './infrastructure/user.gateway';
import { UserService } from './infrastructure/user.service';
import { UserController } from './user.controller';

const userGatewayProvider = {
  provide: USER_GATEWAY,
  useClass: UserService,
};

@Module({
  imports: [DbModule],
  providers: [userGatewayProvider],
  controllers: [UserController],
})
export class UserModule {}
