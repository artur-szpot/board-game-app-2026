import { Inject, Injectable, Logger } from '@nestjs/common';

import { permissionMapper } from '@auth/modules/permissions/mappers/permission.mapper';
import { roleMapper } from '@auth/modules/roles/mappers/role.mapper';
import { userMapper } from '@auth/modules/users/mappers/user.mapper';
import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CustomInternalError } from '@common/errors/service-errors';
import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from '@db/repositories/permission.repository';
import { ROLE_REPOSITORY, RoleRepository } from '@db/repositories/role.repository';
import { USER_REPOSITORY, UserRepository } from '@db/repositories/user.repository';

import { PermissionDto } from '../../permissions/dto/in/permission.dto';
import { RoleDto } from '../../roles/dto/in/role.dto';
import { UserDto } from '../../users/dto/in/user.dto';
import { AdminDataType } from '../enums/AdminDataType.enum';
import { AuthSearchQueryDto } from '../dto/in/auth-search-query.dto';
import {
  AuthSearchResponse,
  AuthSearchResult,
} from '../dto/out/auth-search.response';
import { AuthSearchGateway } from './auth-search.gateway';

type MinimalEntity = { id: string; name: string };
type SearchPageWindow = { offset: number; pageSize: number };

@Injectable()
export class AuthSearchService implements AuthSearchGateway {
  private readonly logger = new Logger(AuthSearchService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  private mapUser(user: UserDto): MinimalEntity {
    return { id: user.id, name: user.username };
  }

  private mapRole(role: RoleDto): MinimalEntity {
    return { id: role.id, name: role.name };
  }

  private mapPermission(permission: PermissionDto): MinimalEntity {
    return { id: permission.permissionType, name: permission.permissionType };
  }

  private mapUserDetail(user: UserDto) {
    return userMapper.fromDomain.toResponse(userMapper.fromDto.toDomain(user));
  }

  private mapRoleDetail(role: RoleDto) {
    return roleMapper.fromDomain.toResponse(roleMapper.fromDto.toDomain(role));
  }

  private mapPermissionDetail(permission: PermissionDto) {
    return permissionMapper.fromDomain.toResponse(
      permissionMapper.fromDto.toDomain(permission),
    );
  }

  private toShortResponse(
    type: AdminDataType,
    entity: MinimalEntity,
    detail?: object,
  ): AuthSearchResult {
    const { id, name } = entity;
    return detail === undefined ? { type, id, name } : { type, id, name, detail };
  }

  private getPageWindow(query: AuthSearchQueryDto): SearchPageWindow | undefined {
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

  public async search(query: AuthSearchQueryDto): Promise<AuthSearchResponse> {
    const { searchTerm, filters, sort, includeDetail } = query;
    const pageWindow = this.getPageWindow(query);
    const dto: GetManyItemsDto = { searchTerm, filters, sort, includeDetail };

    const results: AuthSearchResponse['results'] = [];
    let total = 0;
    let typeStart = 0;

    try {
      for (const type of query.types) {
        switch (type) {
          case AdminDataType.USER: {
            const typeTotal = await this.userRepository.getUsersCount(dto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const items = await this.userRepository.getManyUsers({
              ...dto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  this.mapUser(item),
                  includeDetail ? this.mapUserDetail(item) : undefined,
                ),
              ),
            );
            break;
          }
          case AdminDataType.ROLE: {
            const typeTotal = await this.roleRepository.getRolesCount(dto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const items = await this.roleRepository.getManyRoles({
              ...dto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  this.mapRole(item),
                  includeDetail ? this.mapRoleDetail(item) : undefined,
                ),
              ),
            );
            break;
          }
          case AdminDataType.PERMISSION: {
            const typeTotal = await this.permissionRepository.getPermissionsCount(dto);
            const slice = this.getTypeSlice(pageWindow, typeStart, typeTotal);
            total += typeTotal;
            typeStart += typeTotal;
            if (!slice || slice.pageSize === 0) {
              break;
            }
            const items = await this.permissionRepository.getManyPermissions({
              ...dto,
              pagination: { pageNumber: 0, pageSize: slice.pageSize, offset: slice.offset },
            });
            items.forEach((item) =>
              results.push(
                this.toShortResponse(
                  type,
                  this.mapPermission(item),
                  includeDetail ? this.mapPermissionDetail(item) : undefined,
                ),
              ),
            );
            break;
          }
        }
      }

      return { results, total };
    } catch (error) {
      this.logger.error(`Unexpected error while searching admin data: ${error}`);
      throw new CustomInternalError('searching admin data');
    }
  }
}
