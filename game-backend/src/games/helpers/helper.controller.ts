import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
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

import { CreateHelperDto } from './dto/in/create-helper.dto';
import { UpdateHelperDto } from './dto/in/update-helper.dto';
import { HelperResponse } from './dto/out/helper.response';
import { HELPER_GATEWAY, HelperGateway } from './infrastructure/helper.gateway';

@ApiTags('Helpers')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/helpers')
export class HelperController {
  constructor(
    @Inject(HELPER_GATEWAY)
    private readonly helperGateway: HelperGateway,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  getById(@Param('id') id: string): Promise<HelperResponse> {
    return this.helperGateway.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create helper' })
  @ApiBody({ type: CreateHelperDto })
  @ApiOkResponse({ type: HelperResponse })
  create(@Body() input: CreateHelperDto): Promise<HelperResponse> {
    return this.helperGateway.create(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateHelperDto })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() input: UpdateHelperDto,
  ): Promise<HelperResponse> {
    return this.helperGateway.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete helper by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: HelperResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  delete(@Param('id') id: string): Promise<HelperResponse> {
    return this.helperGateway.delete(id);
  }
}
