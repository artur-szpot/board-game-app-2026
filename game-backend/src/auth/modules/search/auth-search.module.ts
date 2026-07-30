import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { AuthSearchController } from './auth-search.controller';
import { AUTH_SEARCH_GATEWAY } from './infrastructure/auth-search.gateway';
import { AuthSearchService } from './infrastructure/auth-search.service';

const authSearchGatewayProvider = {
  provide: AUTH_SEARCH_GATEWAY,
  useClass: AuthSearchService,
};

@Module({
  imports: [DbModule],
  providers: [authSearchGatewayProvider],
  controllers: [AuthSearchController],
})
export class AuthSearchModule {}
