import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { DbModule } from '@db/db.module';
import { LocationModule } from './modules/locations/location.module';
import { TagModule } from './modules/tags/tag.module';

import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    AuthModule,
    DbModule,
    LocationModule,
    TagModule,
  ],
})
export class AppModule {}
