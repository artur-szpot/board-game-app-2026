import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { TodoController } from './todo.controller';

@Module({
  controllers: [TodoController],
  imports: [DbModule],
})
export class TodoModule {}
