import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { TAG_GATEWAY } from './infrastructure/tag.gateway';
import { TagController } from './tag.controller';

describe('TagController', () => {
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
      controllers: [TagController],
      providers: [{ provide: TAG_GATEWAY, useValue: gateway }],
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

  it('creates a tag endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'tag-1',
      name: 'Strategy',
      parentId: null,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Strategy', parentId: null }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'tag-1', name: 'Strategy' }));
    expect(gateway.create).toHaveBeenCalledWith({ name: 'Strategy', parentId: null });
  });

  it('retrieves a tag by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'tag-1',
      name: 'Strategy',
      parentId: null,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/tags/tag-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'tag-1', name: 'Strategy' }));
    expect(gateway.getById).toHaveBeenCalledWith('tag-1');
  });
});