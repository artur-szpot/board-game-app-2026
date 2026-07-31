import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HELPER_GATEWAY } from './infrastructure/helper.gateway';
import { HelperController } from './helper.controller';

describe('HelperController', () => {
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
      controllers: [HelperController],
      providers: [{ provide: HELPER_GATEWAY, useValue: gateway }],
    }).compile();

    app = moduleRef.createNestApplication();
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

  it('creates a helper endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'helper-1',
      name: 'Auto Score',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/helpers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Score', logic: { rules: [] } }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'helper-1', name: 'Auto Score' }));
    expect(gateway.create).toHaveBeenCalledWith({ name: 'Auto Score', logic: { rules: [] } });
  });

  it('retrieves a helper by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'helper-1',
      name: 'Auto Score',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/helpers/helper-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'helper-1', name: 'Auto Score' }));
    expect(gateway.getById).toHaveBeenCalledWith('helper-1');
  });
});