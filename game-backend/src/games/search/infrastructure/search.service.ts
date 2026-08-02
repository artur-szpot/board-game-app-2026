import { Inject, Injectable, Logger } from '@nestjs/common';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CustomInternalError } from '@common/errors/service-errors';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';

import { GameDataType } from '@common/enums/GameDataType.enum';
import {
    GAME_GATEWAY,
    GameGateway,
} from '../../games/infrastructure/game.gateway';
import {
    HELPER_GATEWAY,
    HelperGateway,
} from '../../helpers/infrastructure/helper.gateway';
import {
    LOCATION_GATEWAY,
    LocationGateway,
} from '../../locations/infrastructure/location.gateway';
import {
    SCORING_SCHEMA_GATEWAY,
    ScoringSchemaGateway,
} from '../../scoring-schemas/infrastructure/scoring-schema.gateway';
import { TAG_GATEWAY, TagGateway } from '../../tags/infrastructure/tag.gateway';
import { SearchQueryDto } from '../dto/in/search-query.dto';
import { SearchResponse, SearchResult } from '../dto/out/search.response';
import { SearchGateway } from './search.gateway';

type MinimalEntity = { id: string; name: string };
type SearchPageWindow = { offset: number; pageSize: number };

@Injectable()
export class SearchService implements SearchGateway {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(GAME_GATEWAY)
    private readonly gameGateway: GameGateway,
    @Inject(TAG_GATEWAY)
    private readonly tagGateway: TagGateway,
    @Inject(LOCATION_GATEWAY)
    private readonly locationGateway: LocationGateway,
    @Inject(HELPER_GATEWAY)
    private readonly helperGateway: HelperGateway,
    @Inject(SCORING_SCHEMA_GATEWAY)
    private readonly scoringSchemaGateway: ScoringSchemaGateway,
  ) {}

  private toShortResponse(
    type: GameDataType,
    entity: MinimalEntity,
    detail?: object,
  ): SearchResult {
    const { id, name } = entity;
    return detail === undefined
      ? { type, id, name }
      : { type, id, name, detail };
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

  public async search(
    query: SearchQueryDto,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<SearchResponse> {
    const { searchTerm, filters, sort, includeDetail } = query;
    const pageWindow = this.getPageWindow(query);
    const results: SearchResponse['results'] = [];
    let total = 0;
    let typeStart = 0;
    const baseDto: GetManyItemsDto =
      userId !== undefined || hasCollectionSuperuserPermission !== undefined
        ? {
            searchTerm,
            filters,
            sort,
            includeDetail,
            userId,
            hasCollectionSuperuserPermission,
          }
        : {
            searchTerm,
            filters,
            sort,
            includeDetail,
          };

    try {
      for (const type of query.types) {
        let typeTotal = 0;
        let items: MinimalEntity[] = [];

        switch (type) {
          case GameDataType.GAME: {
            const countResponse = await this.gameGateway.getMany(baseDto);
            typeTotal = countResponse.total;
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const response = await this.gameGateway.getMany({
              ...baseDto,
              pagination: {
                pageNumber: 0,
                pageSize: slice.pageSize,
                offset: slice.offset,
              },
            });
            items = response.page;
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  item,
                  includeDetail ? item : undefined,
                ),
              ),
            );
            break;
          }
          case GameDataType.TAG: {
            const countResponse = await this.tagGateway.getMany(baseDto);
            typeTotal = countResponse.total;
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const response = await this.tagGateway.getMany({
              ...baseDto,
              pagination: {
                pageNumber: 0,
                pageSize: slice.pageSize,
                offset: slice.offset,
              },
            });
            items = response.page;
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  item,
                  includeDetail ? item : undefined,
                ),
              ),
            );
            break;
          }
          case GameDataType.LOCATION: {
            const countResponse = await this.locationGateway.getMany(baseDto);
            typeTotal = countResponse.total;
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const response = await this.locationGateway.getMany({
              ...baseDto,
              pagination: {
                pageNumber: 0,
                pageSize: slice.pageSize,
                offset: slice.offset,
              },
            });
            items = response.page;
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  item,
                  includeDetail ? item : undefined,
                ),
              ),
            );
            break;
          }
          case GameDataType.HELPER: {
            const countResponse = await this.helperGateway.getMany(baseDto);
            typeTotal = countResponse.total;
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const response = await this.helperGateway.getMany({
              ...baseDto,
              pagination: {
                pageNumber: 0,
                pageSize: slice.pageSize,
                offset: slice.offset,
              },
            });
            items = response.page;
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  item,
                  includeDetail ? item : undefined,
                ),
              ),
            );
            break;
          }
          case GameDataType.SCORING_SCHEMA: {
            const countResponse =
              await this.scoringSchemaGateway.getMany(baseDto);
            typeTotal = countResponse.total;
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const response = await this.scoringSchemaGateway.getMany({
              ...baseDto,
              pagination: {
                pageNumber: 0,
                pageSize: slice.pageSize,
                offset: slice.offset,
              },
            });
            items = response.page;
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  item,
                  includeDetail ? item : undefined,
                ),
              ),
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
