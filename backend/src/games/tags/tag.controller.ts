import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { GetEntityByIdDto } from '@common/dto/in/get-entity-by-id.dto';
import { PaginationDto } from '@common/pagination/dto/in/pagination.dto';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import { Paginated } from '@common/pagination/Paginated';

import { TAG_GATEWAY, TagGateway } from './infrastructure/tag.gateway';
import { CreateTagDto } from './dto/in/create-tag.dto';
import { UpdateTagDto } from './dto/in/update-tag.dto';
import { TagResponse } from './dto/out/tag.response';

@Controller('game-api/tags')
export class TagController {
  constructor(
    @Inject(TAG_GATEWAY)
    private readonly gateway: TagGateway,
  ) {}

  @Get('/:id')
  public async getTagById(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.getById(params.id);
  }

  @Get()
  public async getTags(
    @Query() pagination: PaginationDto,
  ): Promise<Paginated<TagResponse>> {
    return this.gateway.getMany({
      pagination: paginationMapper.fromDto(pagination),
    });
  }

  @Post()
  public async createTag(@Body() body: CreateTagDto): Promise<TagResponse> {
    return this.gateway.create(body);
  }

  @Patch('/:id')
  public async updateTag(
    @Param() params: GetEntityByIdDto,
    @Body() body: UpdateTagDto,
  ): Promise<TagResponse> {
    return this.gateway.update(params.id, body);
  }

  @Delete('/:id')
  public async deleteTag(
    @Param() params: GetEntityByIdDto,
  ): Promise<TagResponse> {
    return this.gateway.delete(params.id);
  }
}
