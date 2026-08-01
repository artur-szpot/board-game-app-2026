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
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';

import { CreateLocationDto } from './dto/in/create-location.dto';
import { UpdateLocationDto } from './dto/in/update-location.dto';
import { LocationResponse } from './dto/out/location.response';
import {
    LOCATION_GATEWAY,
    LocationGateway,
} from './infrastructure/location.gateway';

@ApiTags('Locations')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/locations')
export class LocationController {
  constructor(
    @Inject(LOCATION_GATEWAY)
    private readonly gateway: LocationGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async getLocationById(
    @Param() params: GetEntityByIdDto,
  ): Promise<LocationResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiOkResponse({ type: LocationResponse })
  public async createLocation(
    @Body() body: CreateLocationDto,
  ): Promise<LocationResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateLocationDto })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async updateLocation(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateLocationDto,
  ): Promise<LocationResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete location by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: LocationResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async deleteLocation(
    @Param() params: GetEntityByIdDto,
  ): Promise<LocationResponse> {
    return this.gateway.delete(params.id);
  }
}
