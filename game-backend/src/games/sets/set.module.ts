import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { SET_GATEWAY } from './infrastructure/set.gateway';
import { SetService } from './infrastructure/set.service';
import { SetController } from './set.controller';

const setGatewayProvider = {
  provide: SET_GATEWAY,
  useClass: SetService,
};

@Module({
  imports: [DbModule],
  providers: [setGatewayProvider],
  controllers: [SetController],
  exports: [setGatewayProvider],
})
export class SetModule {}
