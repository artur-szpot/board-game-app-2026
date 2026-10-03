import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { CustomNotFoundError } from '@common/errors/service-errors';
import { HelperController } from './helpers/helper.controller';
import { HELPER_GATEWAY } from './helpers/infrastructure/helper.gateway';
import { SetController } from './sets/set.controller';
import { SET_GATEWAY } from './sets/infrastructure/set.gateway';
import { SearchController } from './search/search.controller';
import { SEARCH_GATEWAY } from './search/infrastructure/search.gateway';
import { GameController } from './games/game.controller';
import { GAME_GATEWAY } from './games/infrastructure/game.gateway';

describe('DATA_MANAGEMENT API authorization', () => {
  let app: INestApplication;
  let url: string;
  let permissions: PermissionDefinition[] = [];
  const helper = { id: 'helper-1', logic: { sets: { people: 'set-1' } } };
  const set = { id: 'set-1' };
  const helpers = {
    getById: jest.fn(),
    create: jest.fn(),
    createSystem: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const sets = {
    getById: jest.fn(),
    getByIds: jest.fn(),
    create: jest.fn(),
    createSystem: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const games = { getById: jest.fn() };
  const search = { search: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [
        HelperController,
        SetController,
        SearchController,
        GameController,
      ],
      providers: [
        { provide: HELPER_GATEWAY, useValue: helpers },
        { provide: SET_GATEWAY, useValue: sets },
        { provide: GAME_GATEWAY, useValue: games },
        { provide: SEARCH_GATEWAY, useValue: search },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> };
        }) => {
          context.switchToHttp().getRequest().user = {
            id: 'user-1',
            permissions,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    permissions = [];
    helpers.getById.mockResolvedValue(helper);
    sets.getById.mockResolvedValue(set);
    sets.getByIds.mockResolvedValue([set]);
    games.getById.mockResolvedValue({ helpers: [helper] });
    search.search.mockResolvedValue({ results: [], total: 0 });
  });
  const request = (path: string, method = 'GET', body?: object) =>
    fetch(`${url}/game-api/${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

  it.each(['helpers', 'sets'])(
    '%s management reads need READ; writes need FULL',
    async (resource) => {
      permissions = [[PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL]];
      expect((await request(`${resource}/item-1`)).status).toBe(403);
      permissions = [[PermissionType.DATA_MANAGEMENT, PermissionLevel.READ]];
      expect((await request(`${resource}/item-1`)).status).toBe(200);
      for (const [path, method] of [
        [resource, 'POST'],
        [`${resource}/item-1`, 'PUT'],
        [`${resource}/item-1`, 'DELETE'],
      ]) {
        expect(
          (await request(path, method, { name: 'people', data: {} })).status,
        ).toBe(403);
      }
      permissions = [[PermissionType.DATA_MANAGEMENT, PermissionLevel.FULL]];
      expect((await request(`${resource}/item-1`)).status).toBe(200);
      expect(
        (await request(resource, 'POST', { name: 'people', data: {} })).status,
      ).toBe(201);
      expect(
        (await request(`${resource}/item-1`, 'PUT', { name: 'people' })).status,
      ).toBe(200);
      expect((await request(`${resource}/item-1`, 'DELETE')).status).toBe(200);
    },
  );

  it.each(['helpers', 'sets'])(
    '%s SYSTEM creation requires both FULL permissions',
    async (resource) => {
      permissions = [[PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL]];
      expect((await request(`${resource}/system`, 'POST', {})).status).toBe(
        403,
      );
      permissions = [[PermissionType.DATA_MANAGEMENT, PermissionLevel.FULL]];
      expect((await request(`${resource}/system`, 'POST', {})).status).toBe(
        403,
      );
      permissions.push([
        PermissionType.SYSTEM_COLLECTION,
        PermissionLevel.FULL,
      ]);
      expect((await request(`${resource}/system`, 'POST', {})).status).toBe(
        201,
      );
    },
  );

  it('checks each search category and rejects unauthorized mixed searches before querying', async () => {
    permissions = [[PermissionType.DATA_MANAGEMENT, PermissionLevel.READ]];
    expect(
      (await request('search', 'POST', { types: ['helper', 'set'] })).status,
    ).toBe(201);
    search.search.mockClear();
    expect(
      (await request('search', 'POST', { types: ['helper', 'game'] })).status,
    ).toBe(403);
    expect(search.search).not.toHaveBeenCalled();
    permissions = [[PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL]];
    expect((await request('search', 'POST', { types: ['set'] })).status).toBe(
      403,
    );
    expect((await request('search', 'POST', { types: ['game'] })).status).toBe(
      201,
    );
  });

  it('allows assigned game helper execution without DATA_MANAGEMENT but requires game READ', async () => {
    expect((await request('games/game-1/helpers/helper-1')).status).toBe(403);
    permissions = [[PermissionType.GAME_COLLECTIONS, PermissionLevel.READ]];
    const response = await request('games/game-1/helpers/helper-1');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ helper, sets: [set] });
    expect(sets.getByIds).toHaveBeenCalledWith(['set-1'], {
      userId: 'user-1',
      hasCollectionSuperuserPermission: false,
    });
  });

  it('rejects unassigned helpers and invisible games without reading sets', async () => {
    permissions = [[PermissionType.GAME_COLLECTIONS, PermissionLevel.READ]];
    expect((await request('games/game-1/helpers/other-helper')).status).toBe(
      404,
    );
    expect(sets.getByIds).not.toHaveBeenCalled();
    games.getById.mockRejectedValueOnce(new CustomNotFoundError('game'));
    expect((await request('games/private-game/helpers/helper-1')).status).toBe(
      404,
    );
    expect(sets.getByIds).not.toHaveBeenCalled();
  });

  it('reports missing referenced sets instead of returning incomplete runner data', async () => {
    permissions = [[PermissionType.GAME_COLLECTIONS, PermissionLevel.READ]];
    sets.getByIds.mockResolvedValueOnce([]);
    expect((await request('games/game-1/helpers/helper-1')).status).toBe(404);
  });
});
