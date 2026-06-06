import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { DbModule } from '@db/db.module';
import { TodoModule } from '@todo/todo.module';

import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    AuthModule,
    TodoModule,
    DbModule,
  ],
})
export class AppModule {}
