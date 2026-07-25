import { Inject, Injectable, Logger } from '@nestjs/common';

import { CustomInternalError } from '@common/errors/service-errors';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import {
  GAME_REPOSITORY,
  GameRepository,
} from '@db/repositories/game.repository';
import {
  HELPER_REPOSITORY,
  HelperRepository,
} from '@db/repositories/helper.repository';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '@db/repositories/location.repository';
import {
  SCORING_SCHEMA_REPOSITORY,
  ScoringSchemaRepository,
} from '@db/repositories/scoring-schema.repository';
import { TAG_REPOSITORY, TagRepository } from '@db/repositories/tag.repository';

import { GameDataType } from '@common/enums/GameDataType.enum';
import { SearchQueryDto } from '../dto/in/search-query.dto';
import { SearchResponse, SearchResult } from '../dto/out/search.response';
import { SearchGateway } from './search.gateway';

type MinimalEntity = { id: string; name: string };
type SearchPageWindow = { offset: number; pageSize: number };

@Injectable()
export class SearchService implements SearchGateway {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
    @Inject(HELPER_REPOSITORY)
    private readonly helperRepository: HelperRepository,
    @Inject(SCORING_SCHEMA_REPOSITORY)
    private readonly scoringSchemaRepository: ScoringSchemaRepository,
  ) {}

  private toShortResponse(
    type: GameDataType,
    entity: MinimalEntity,
    detail?: object,
  ): SearchResult {
    const { id, name } = entity;
    return detail === undefined ? { type, id, name } : { type, id, name, detail };
  }

  private getPageWindow(query: SearchQueryDto): SearchPageWindow | undefined {
    const pagination = query.pagination
      ? paginationMapper.fromDto(query.pagination)
      : undefined;

    if (!pagination) {
      return undefined;
    }

    return {
      offset: pagination.pageNumber * pagination.pageSize,
      pageSize: pagination.pageSize,
    };
  }

  private getTypeSlice(
    pageWindow: SearchPageWindow | undefined,
    typeStart: number,
    typeTotal: number,
  ) {
    if (!pageWindow) {
      return { offset: 0, pageSize: typeTotal };
    }

    const typeEnd = typeStart + typeTotal;
    const pageEnd = pageWindow.offset + pageWindow.pageSize;
    const overlapStart = Math.max(pageWindow.offset, typeStart);
    const overlapEnd = Math.min(pageEnd, typeEnd);

    if (overlapStart >= overlapEnd) {
      return undefined;
    }

    return {
      offset: overlapStart - typeStart,
      pageSize: overlapEnd - overlapStart,
    };
  }

  public async search(query: SearchQueryDto): Promise<SearchResponse> {
    const { searchTerm, filters, sort, includeDetail } = query;
    const pageWindow = this.getPageWindow(query);
    const results: SearchResponse['results'] = [];
    let total = 0;
    let typeStart = 0;
    const baseDto = { searchTerm, filters, sort, includeDetail };

    try {
      for (const type of query.types) {
        let typeTotal = 0;
        let items: MinimalEntity[] = [];

        switch (type) {
          case GameDataType.GAME: {
            typeTotal = await this.gameRepository.getGamesCount(baseDto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            items = await this.gameRepository.getManyGames({
              ...baseDto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(this.toShortResponse(type, item, includeDetail ? item : undefined)),
            );
            break;
          }
          case GameDataType.TAG: {
            typeTotal = await this.tagRepository.getTagsCount(baseDto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            items = await this.tagRepository.getManyTags({
              ...baseDto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(this.toShortResponse(type, item, includeDetail ? item : undefined)),
            );
            break;
          }
          case GameDataType.LOCATION: {
            typeTotal = await this.locationRepository.getLocationsCount(baseDto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            items = await this.locationRepository.getManyLocations({
              ...baseDto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(this.toShortResponse(type, item, includeDetail ? item : undefined)),
            );
            break;
          }
          case GameDataType.HELPER: {
            typeTotal = await this.helperRepository.getHelpersCount(baseDto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            items = await this.helperRepository.getManyHelpers({
              ...baseDto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(this.toShortResponse(type, item, includeDetail ? item : undefined)),
            );
            break;
          }
          case GameDataType.SCORING_SCHEMA: {
            typeTotal = await this.scoringSchemaRepository.getScoringSchemasCount(baseDto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            items = await this.scoringSchemaRepository.getManyScoringSchemas({
              ...baseDto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(this.toShortResponse(type, item, includeDetail ? item : undefined)),
            );
            break;
          }
        }
      }

      return { results, total };
    } catch (error) {
      this.logger.error(`Unexpected error while searching: ${error}`);
      throw new CustomInternalError('searching');
    }
  }
}
