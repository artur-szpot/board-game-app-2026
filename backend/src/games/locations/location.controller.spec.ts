import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { LOCATION_GATEWAY } from './infrastructure/location.gateway';
import { LocationController } from './location.controller';

describe('LocationController (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const gateway = {
    getById: jest.fn(),
    getMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [{ provide: LOCATION_GATEWAY, useValue: gateway }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    await app.listen(0);

    const address = (app.getHttpServer()).address();
    const port = address?.port || 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a location via the game-api endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'loc-1',
      name: 'Forest',
      description: 'A place',
      parentId: null,
      isGameId: true,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Forest', description: 'A place', isGameId: true }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'loc-1', name: 'Forest' }));
    expect(gateway.create).toHaveBeenCalledWith({
      name: 'Forest',
      description: 'A place',
      isGameId: true,
    });
  });

  it('fetches a location by id from the game-api endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'loc-1',
      name: 'Forest',
      description: 'A place',
      parentId: null,
      isGameId: true,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/locations/loc-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'loc-1', name: 'Forest' }));
    expect(gateway.getById).toHaveBeenCalledWith('loc-1');
  });
});
