import { Inject, Injectable, Logger } from '@nestjs/common';

import { InternalError, NotFoundError } from '@common/errors/service-errors';
import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from '@db/repositories/permission.repository';

import { PermissionResponse } from '../dto/out/permission.response';
import { PermissionType } from '../enums/permission-type.enum';
import { permissionMapper } from '../mappers/permission.mapper';
import { PermissionGateway } from './permission.gateway';

@Injectable()
export class PermissionService implements PermissionGateway {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  public async getByType(
    permissionType: PermissionType,
  ): Promise<PermissionResponse> {
    try {
      const permissionDto =
        await this.permissionRepository.getPermissionByType(permissionType);
      if (!permissionDto) {
        throw new NotFoundError(`permission of type ${permissionType}`);
      }
      const permission = permissionMapper.fromDto.toDomain(permissionDto);
      return permissionMapper.fromDomain.toResponse(permission);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving permission with type "${permissionType}": ${error}`,
      );
      throw new InternalError('retrieving the permission');
    }
  }

  public async getMany(
    pagination?: Pagination,
  ): Promise<Paginated<PermissionResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.permissionRepository.getManyPermissions(pagination),
        this.permissionRepository.getAllPermissionsCount(),
      ]);
      const permissions = items.map(permissionMapper.fromDto.toDomain);
      return {
        page: permissions.map(permissionMapper.fromDomain.toResponse),
        total,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error while retrieving permissions: ${error}`,
      );
      throw new InternalError('retrieving permissions');
    }
  }
}
