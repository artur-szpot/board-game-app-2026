import { Test } from '@nestjs/testing';

import {
  PERMISSION_REPOSITORY,
} from '@db/repositories/permission.repository';
import { ROLE_REPOSITORY } from '@db/repositories/role.repository';
import { USER_REPOSITORY } from '@db/repositories/user.repository';

import { AdminDataType } from '../enums/AdminDataType.enum';
import { AuthSearchService } from './auth-search.service';

describe('AuthSearchService', () => {
  it('returns combined short results for requested types', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthSearchService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            getManyUsers: jest
              .fn()
              .mockResolvedValue([{ id: 'u1', username: 'alice' }]),
            getUsersCount: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: ROLE_REPOSITORY,
          useValue: {
            getManyRoles: jest.fn().mockResolvedValue([{ id: 'r1', name: 'GM' }]),
            getRolesCount: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: PERMISSION_REPOSITORY,
          useValue: {
            getManyPermissions: jest
              .fn()
              .mockResolvedValue([
                { permissionType: 'USERS', description: 'Users access' },
              ]),
            getPermissionsCount: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AuthSearchService);
    await expect(
      service.search({
        types: [
          AdminDataType.USER,
          AdminDataType.ROLE,
          AdminDataType.PERMISSION,
        ],
        pagination: { pageSize: 10, pageNumber: 0 },
      }),
    ).resolves.toEqual({
      results: [
        { type: AdminDataType.USER, id: 'u1', name: 'alice' },
        { type: AdminDataType.ROLE, id: 'r1', name: 'GM' },
        {
          type: AdminDataType.PERMISSION,
          id: 'USERS',
          name: 'USERS',
        },
      ],
      total: 3,
    });
  });

  it('includes detailed permission payloads when requested', async () => {
    const permission = {
      permissionType: 'USERS',
      description: 'Users access',
      permissionLevel: 'READ',
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthSearchService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            getManyUsers: jest.fn(),
            getUsersCount: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: ROLE_REPOSITORY,
          useValue: {
            getManyRoles: jest.fn(),
            getRolesCount: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: PERMISSION_REPOSITORY,
          useValue: {
            getManyPermissions: jest.fn().mockResolvedValue([permission]),
            getPermissionsCount: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AuthSearchService);
    await expect(
      service.search({
        types: [AdminDataType.PERMISSION],
        includeDetail: true,
      }),
    ).resolves.toEqual({
      results: [
        {
          type: AdminDataType.PERMISSION,
          id: 'USERS',
          name: 'USERS',
          detail: permission,
        },
      ],
      total: 1,
    });
  });
});
