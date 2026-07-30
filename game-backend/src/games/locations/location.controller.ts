import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';

import {
  LOCATION_GATEWAY,
  LocationGateway,
} from './infrastructure/location.gateway';
import { CreateLocationDto } from './dto/in/create-location.dto';
import { UpdateLocationDto } from './dto/in/update-location.dto';
import { LocationResponse } from './dto/out/location.response';

@Controller('game-api/locations')
export class LocationController {
  constructor(
    @Inject(LOCATION_GATEWAY)
    private readonly gateway: LocationGateway,
  ) {}

  @Get('/:id')
  public async getLocationById(
    @Param() params: GetEntityByIdDto,
  ): Promise<LocationResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  public async createLocation(
    @Body() body: CreateLocationDto,
  ): Promise<LocationResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  public async updateLocation(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateLocationDto,
  ): Promise<LocationResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  public async deleteLocation(
    @Param() params: GetEntityByIdDto,
  ): Promise<LocationResponse> {
    return this.gateway.delete(params.id);
  }
}
