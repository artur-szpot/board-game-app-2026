import { Logger } from '@nestjs/common';

import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

import { PermissionDto } from '../dto/in/permission.dto';
import { PermissionLevel } from '../enums/permission-level.enum';
import { PermissionType } from '../enums/permission-type.enum';
import { permissionMapper } from '../mappers/permission.mapper';
import { Permission } from './Permission';

describe('Permission', () => {
  const logger = new Logger('PermissionTest');

  it('should create a Permission based on correct props without ID', async () => {
    const props = {
      description: 'text',
      permissionType: PermissionType.TODOS,
      permissionLevel: PermissionLevel.FULL,
    };
    const entity = new Permission(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Permission);
    expect(entity.toString()).toEqual(
      `Permission type: ${props.permissionType}, level: ${props.permissionLevel}`,
    );
    expect(entity.getProps()).toEqual({
      id: 'mocked-id',
      ...props,
    });
  });

  it('should create a Permission based on correct props with ID', async () => {
    const props = {
      id: '1',
      description: 'text',
      permissionType: PermissionType.TODOS,
      permissionLevel: PermissionLevel.FULL,
    };
    const entity = new Permission(logger, props);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Permission);
    expect(entity.toString()).toEqual(
      `Permission type: ${props.permissionType}, level: ${props.permissionLevel}`,
    );
    expect(entity.getProps()).toEqual(props);
  });

  it('should create a Permission based on correct DTO', async () => {
    const dto: PermissionDto = {
      description: 'text',
      permissionType: PermissionType.TODOS,
      permissionLevel: PermissionLevel.FULL,
    };
    const entity = permissionMapper.fromDto.toDomain(dto);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Permission);
    expect(entity.toString()).toEqual(
      `Permission type: ${dto.permissionType}, level: ${dto.permissionLevel}`,
    );
    expect(entity.getProps()).toEqual({ ...dto, id: 'mocked-id' });
  });

  it('should create a Permission based on correct DTO without level', async () => {
    const dto: PermissionDto = {
      description: 'text',
      permissionType: PermissionType.TODOS,
    };
    const entity = permissionMapper.fromDto.toDomain(dto);
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(Permission);
    expect(entity.toString()).toEqual(`Permission type: ${dto.permissionType}`);
    expect(entity.getProps()).toEqual({
      ...dto,
      id: 'mocked-id',
      permissionLevel: undefined,
    });
  });

  it('should fail to create a Permission based on incorrect props', async () => {
    const props = {
      id: 1,
      description: 'text',
      permissionType: PermissionType.TODOS,
      permissionLevel: PermissionLevel.FULL,
    };
    try {
      new Permission(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('id: NonEmptyString');
    }
  });

  it('should fail to create a Permission based on incomplete props', async () => {
    const props = {
      permissionType: PermissionType.TODOS,
      permissionLevel: PermissionLevel.FULL,
    };
    try {
      new Permission(logger, props);
      // Fail test if this doesn't throw
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEntityProps);
      expect(error.message).toContain('description: NonEmptyString');
    }
  });
});
