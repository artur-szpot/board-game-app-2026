import { Module } from '@nestjs/common';

import { TagController } from './tag.controller';
import { TagService } from './infrastructure/tag.service';
import { TAG_GATEWAY } from './infrastructure/tag.gateway';

const tagGatewayProvider = {
  provide: TAG_GATEWAY,
  useClass: TagService,
};

@Module({
  providers: [tagGatewayProvider],
  controllers: [TagController],
})
export class TagModule {}
