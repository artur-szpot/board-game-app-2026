import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';

import { CreateHelperDto } from './dto/in/create-helper.dto';
import { UpdateHelperDto } from './dto/in/update-helper.dto';
import { HelperGateway, HELPER_GATEWAY } from './infrastructure/helper.gateway';

@Controller('game-api/helpers')
export class HelperController {
  constructor(
    @Inject(HELPER_GATEWAY)
    private readonly helperGateway: HelperGateway,
  ) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.helperGateway.getById(id);
  }

  @Get()
  getMany() {
    return this.helperGateway.getMany();
  }

  @Post()
  create(@Body() input: CreateHelperDto) {
    return this.helperGateway.create(input);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: UpdateHelperDto) {
    return this.helperGateway.update(id, input);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.helperGateway.delete(id);
  }
}
