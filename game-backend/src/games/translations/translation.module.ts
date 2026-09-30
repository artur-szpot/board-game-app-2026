import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { TranslationService } from './infrastructure/translation.service';
import { TranslationController } from './translation.controller';

@Module({
  imports: [DbModule],
  providers: [TranslationService],
  controllers: [TranslationController],
})
export class TranslationModule {}
