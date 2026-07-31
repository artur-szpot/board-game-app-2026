import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { LocationController } from './location.controller';
import { LocationService } from './infrastructure/location.service';
import { LOCATION_GATEWAY } from './infrastructure/location.gateway';

const locationGatewayProvider = {
  provide: LOCATION_GATEWAY,
  useClass: LocationService,
};

@Module({
  imports: [DbModule],
  providers: [locationGatewayProvider],
  controllers: [LocationController],
  exports: [locationGatewayProvider],
})
export class LocationModule {}
