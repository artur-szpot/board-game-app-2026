import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { ScoringSchemaController } from './scoring-schema.controller';
import { ScoringSchemaService } from './infrastructure/scoring-schema.service';
import { SCORING_SCHEMA_GATEWAY } from './infrastructure/scoring-schema.gateway';

const scoringSchemaGatewayProvider = {
  provide: SCORING_SCHEMA_GATEWAY,
  useClass: ScoringSchemaService,
};

@Module({
  imports: [DbModule],
  providers: [scoringSchemaGatewayProvider],
  controllers: [ScoringSchemaController],
})
export class ScoringSchemaModule {}
