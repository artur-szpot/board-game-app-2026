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

import { CreateTagDto } from './dto/in/create-tag.dto';
import { UpdateTagDto } from './dto/in/update-tag.dto';
import { TagResponse } from './dto/out/tag.response';
import { TAG_GATEWAY, TagGateway } from './infrastructure/tag.gateway';

@ApiTags('Tags')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@Controller('game-api/tags')
export class TagController {
  constructor(
    @Inject(TAG_GATEWAY)
    private readonly gateway: TagGateway,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async getTagById(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagResponse })
  public async createTag(@Body() body: CreateTagDto): Promise<TagResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async updateTag(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateTagDto,
  ): Promise<TagResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: TagResponse })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  public async deleteTag(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.delete(params.id);
  }
}
