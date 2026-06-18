import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { HelperController } from './helper.controller';
import { HELPER_GATEWAY } from './infrastructure/helper.gateway';
import { HelperService } from './infrastructure/helper.service';

const helperGatewayProvider = {
  provide: HELPER_GATEWAY,
  useClass: HelperService,
};

@Module({
  imports: [DbModule],
  providers: [helperGatewayProvider],
  controllers: [HelperController],
})
export class HelperModule {}
