import { Inject, Injectable, Logger } from '@nestjs/common';

import { CustomInternalError } from '@common/errors/service-errors';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import {
  GAME_REPOSITORY,
  GameRepository,
} from '@db/repositories/game.repository';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '@db/repositories/location.repository';
import { TAG_REPOSITORY, TagRepository } from '@db/repositories/tag.repository';

import { SearchQueryDto } from '../dto/in/search-query.dto';
import {
  SearchResponse,
  SearchResult,
  SearchResultType,
} from '../dto/out/search.response';
import { SearchGateway } from './search.gateway';

type MinimalEntity = { id: string; name: string };

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
  ) {}

  private toShortResponse(
    type: SearchResultType,
    entity: MinimalEntity,
  ): SearchResult {
    const { id, name } = entity;
    return { type, id, name };
  }

  public async search(query: SearchQueryDto): Promise<SearchResponse> {
    const requestedTypes = new Set(query.types);
    const { searchTerm, filters } = query;
    const pagination = paginationMapper.fromDto(query.pagination);
    const results: SearchResponse['results'] = [];
    const addToResults = (type: SearchResultType, items: MinimalEntity[]) =>
      items.forEach((item) => results.push(this.toShortResponse(type, item)));
    const dto = { pagination, searchTerm, filters };

    try {
      if (requestedTypes.has('game')) {
        const items = await this.gameRepository.getManyGames(dto);
        addToResults('game', items);
      }
      if (requestedTypes.has('tag')) {
        const items = await this.tagRepository.getManyTags(dto);
        addToResults('tag', items);
      }
      if (requestedTypes.has('location')) {
        const items = await this.locationRepository.getManyLocations(dto);
        addToResults('location', items);
      }

      return { results };
    } catch (error) {
      this.logger.error(`Unexpected error while searching: ${error}`);
      throw new CustomInternalError('searching');
    }
  }
}
