import { GUARDS_METADATA } from '@nestjs/common/constants';

import { PERMISSIONS_KEY } from '@auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

import { GameScoreController } from './game-scores/game-score.controller';
import { GameController } from './games/game.controller';
import { HelperController } from './helpers/helper.controller';
import { LocationController } from './locations/location.controller';
import { ScoringSchemaController } from './scoring-schemas/scoring-schema.controller';
import { SearchController } from './search/search.controller';
import { TagController } from './tags/tag.controller';

const expectControllerGuards = (controller: object) => {
  const guards = Reflect.getMetadata(GUARDS_METADATA, controller) ?? [];
  expect(guards).toEqual(
    expect.arrayContaining([JwtAuthGuard, PermisionsGuard]),
  );
};

const expectRequiredPermission = (
  controller: object,
  methodName: string,
  level: PermissionLevel,
  type = PermissionType.GAME_COLLECTIONS,
) => {
  const permissions = Reflect.getMetadata(
    PERMISSIONS_KEY,
    (controller as Record<string, unknown>)[methodName],
  );

  expect(permissions).toEqual([[type, level]]);
};

describe('Game API auth/permissions metadata', () => {
  it('applies JwtAuthGuard and PermisionsGuard to all game-api controllers', () => {
    expectControllerGuards(TagController);
    expectControllerGuards(LocationController);
    expectControllerGuards(GameController);
    expectControllerGuards(HelperController);
    expectControllerGuards(ScoringSchemaController);
    expectControllerGuards(GameScoreController);
    expectControllerGuards(SearchController);
  });

  it('uses READ permission for all GET handlers', () => {
    expectRequiredPermission(
      TagController.prototype,
      'getTagById',
      PermissionLevel.READ,
    );
    expectRequiredPermission(
      LocationController.prototype,
      'getLocationById',
      PermissionLevel.READ,
    );
    expectRequiredPermission(
      GameController.prototype,
      'getById',
      PermissionLevel.READ,
    );
    expectRequiredPermission(
      HelperController.prototype,
      'getById',
      PermissionLevel.READ,
    );
    expectRequiredPermission(
      ScoringSchemaController.prototype,
      'getById',
      PermissionLevel.READ,
    );
    expectRequiredPermission(
      GameScoreController.prototype,
      'getById',
      PermissionLevel.READ,
    );
  });

  it('uses FULL permission for non-GET handlers', () => {
    expectRequiredPermission(
      TagController.prototype,
      'createTag',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      TagController.prototype,
      'updateTag',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      TagController.prototype,
      'deleteTag',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      LocationController.prototype,
      'createLocation',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      LocationController.prototype,
      'updateLocation',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      LocationController.prototype,
      'deleteLocation',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      GameController.prototype,
      'create',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      GameController.prototype,
      'update',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      GameController.prototype,
      'delete',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      HelperController.prototype,
      'create',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      HelperController.prototype,
      'update',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      HelperController.prototype,
      'delete',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      ScoringSchemaController.prototype,
      'create',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      ScoringSchemaController.prototype,
      'update',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      ScoringSchemaController.prototype,
      'delete',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      GameScoreController.prototype,
      'create',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      GameScoreController.prototype,
      'update',
      PermissionLevel.FULL,
    );
    expectRequiredPermission(
      GameScoreController.prototype,
      'delete',
      PermissionLevel.FULL,
    );

    expectRequiredPermission(
      SearchController.prototype,
      'search',
      PermissionLevel.FULL,
    );
  });

  it('requires SYSTEM_COLLECTION FULL for SYSTEM create handlers', () => {
    expectRequiredPermission(
      TagController.prototype,
      'createSystemTag',
      PermissionLevel.FULL,
      PermissionType.SYSTEM_COLLECTION,
    );
    expectRequiredPermission(
      HelperController.prototype,
      'createSystem',
      PermissionLevel.FULL,
      PermissionType.SYSTEM_COLLECTION,
    );
    expectRequiredPermission(
      ScoringSchemaController.prototype,
      'createSystem',
      PermissionLevel.FULL,
      PermissionType.SYSTEM_COLLECTION,
    );
  });
});
