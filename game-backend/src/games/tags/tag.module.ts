import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';
import { TAG_GATEWAY } from './infrastructure/tag.gateway';
import { TagService } from './infrastructure/tag.service';
import { TagController } from './tag.controller';

const tagGatewayProvider = {
  provide: TAG_GATEWAY,
  useClass: TagService,
};

@Module({
  imports: [DbModule],
  providers: [tagGatewayProvider],
  controllers: [TagController],
  exports: [tagGatewayProvider],
})
export class TagModule {}
