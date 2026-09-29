import { BadRequestException } from '@nestjs/common';

import { CustomNotFoundError } from '@common/errors/service-errors';
import { GameScoreRepository } from '@db/repositories/game-score.repository';
import { ScoringSchemaRepository } from '@db/repositories/scoring-schema.repository';

import { testScoringSchemaDefinition } from '../../scoring-schemas/dto/schema/test-scoring-schema.fixture';
import { CreateGameScoreDto } from '../dto/in/create-game-score.dto';
import { GameScoreService } from './game-score.service';

describe('GameScoreService', () => {
  const schema = testScoringSchemaDefinition();
  let gameScoreRepository: jest.Mocked<GameScoreRepository>;
  let scoringSchemaRepository: jest.Mocked<ScoringSchemaRepository>;
  let service: GameScoreService;

  const createDto: CreateGameScoreDto = {
    gameId: 'game-1',
    schemaId: 'schema-1',
    scores: {
      players: ['D', 'B'],
      values: { 'row-coins': { D: 3, B: 5 } },
    },
  };

  const storedScore = {
    id: 'score-1',
    ownerId: 'user-1',
    private: true,
    gameId: 'game-1',
    playedOn: new Date(),
    schemaId: 'schema-1',
    scores: createDto.scores,
    createdOn: new Date(),
    updatedOn: new Date(),
  };

  beforeEach(() => {
    gameScoreRepository = {
      getGameScoreById: jest.fn(),
      getManyGameScores: jest.fn(),
      getGameScoresCount: jest.fn(),
      createGameScore: jest.fn(),
      updateGameScore: jest.fn(),
      deleteGameScore: jest.fn(),
    } as unknown as jest.Mocked<GameScoreRepository>;
    scoringSchemaRepository = {
      getScoringSchemaById: jest.fn(),
    } as unknown as jest.Mocked<ScoringSchemaRepository>;

    service = new GameScoreService(
      gameScoreRepository,
      scoringSchemaRepository,
    );
  });

  it('creates a game score when every row ID is known to the schema', async () => {
    scoringSchemaRepository.getScoringSchemaById.mockResolvedValueOnce({
      schema,
    } as never);
    gameScoreRepository.createGameScore.mockResolvedValueOnce(
      storedScore as never,
    );

    const result = await service.create(createDto, 'user-1');

    expect(gameScoreRepository.createGameScore).toHaveBeenCalledWith(
      createDto,
      'user-1',
    );
    expect(result.schemaId).toBe('schema-1');
  });

  it('rejects scores referencing rows outside the schema', async () => {
    scoringSchemaRepository.getScoringSchemaById.mockResolvedValueOnce({
      schema,
    } as never);

    await expect(
      service.create(
        {
          ...createDto,
          scores: { players: ['D'], values: { 'row-unknown': { D: 1 } } },
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gameScoreRepository.createGameScore).not.toHaveBeenCalled();
  });

  it('rejects scores for a schema the user cannot see', async () => {
    scoringSchemaRepository.getScoringSchemaById.mockResolvedValueOnce(null);

    await expect(service.create(createDto, 'user-1')).rejects.toBeInstanceOf(
      CustomNotFoundError,
    );
    expect(gameScoreRepository.createGameScore).not.toHaveBeenCalled();
  });

  it('passes the gameId filter through to the repository', async () => {
    gameScoreRepository.getManyGameScores.mockResolvedValueOnce([
      storedScore as never,
    ]);
    gameScoreRepository.getGameScoresCount.mockResolvedValueOnce(1);

    const dto = { userId: 'user-1', filters: { gameId: 'game-1' } };
    const result = await service.getMany(dto);

    expect(gameScoreRepository.getManyGameScores).toHaveBeenCalledWith(dto);
    expect(gameScoreRepository.getGameScoresCount).toHaveBeenCalledWith(dto);
    expect(result.total).toBe(1);
  });
});
