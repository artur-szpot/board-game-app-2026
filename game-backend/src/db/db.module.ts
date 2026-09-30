import { Module } from '@nestjs/common';

import { PostgresConnector } from './connectors/postgres/PostgresConnector';
import { PostgresGameScoreRepository } from './connectors/postgres/game-score.pg-repository';
import { PostgresGameRepository } from './connectors/postgres/game.pg-repository';
import { PostgresHelperRepository } from './connectors/postgres/helper.pg-repository';
import { PostgresLocationRepository } from './connectors/postgres/location.pg-repository';
import { PostgresPermissionRepository } from './connectors/postgres/permission.pg-repository';
import { PostgresRoleRepository } from './connectors/postgres/role.pg-repository';
import { PostgresScoringSchemaRepository } from './connectors/postgres/scoring-schema.pg-repository';
import { PostgresSetRepository } from './connectors/postgres/set.pg-repository';
import { PostgresTagRepository } from './connectors/postgres/tag.pg-repository';
import { PostgresTranslationRepository } from './connectors/postgres/translation.pg-repository';
import { PostgresUserRepository } from './connectors/postgres/user.pg-repository';
import { GAME_SCORE_REPOSITORY } from './repositories/game-score.repository';
import { GAME_REPOSITORY } from './repositories/game.repository';
import { HELPER_REPOSITORY } from './repositories/helper.repository';
import { LOCATION_REPOSITORY } from './repositories/location.repository';
import { PERMISSION_REPOSITORY } from './repositories/permission.repository';
import { ROLE_REPOSITORY } from './repositories/role.repository';
import { SCORING_SCHEMA_REPOSITORY } from './repositories/scoring-schema.repository';
import { SET_REPOSITORY } from './repositories/set.repository';
import { TAG_REPOSITORY } from './repositories/tag.repository';
import { TRANSLATION_REPOSITORY } from './repositories/translation.repository';
import { USER_REPOSITORY } from './repositories/user.repository';

const userProvider = {
  provide: USER_REPOSITORY,
  useClass: PostgresUserRepository,
};
const roleProvider = {
  provide: ROLE_REPOSITORY,
  useClass: PostgresRoleRepository,
};
const permissionProvider = {
  provide: PERMISSION_REPOSITORY,
  useClass: PostgresPermissionRepository,
};
const helperProvider = {
  provide: HELPER_REPOSITORY,
  useClass: PostgresHelperRepository,
};
const locationProvider = {
  provide: LOCATION_REPOSITORY,
  useClass: PostgresLocationRepository,
};
const tagProvider = {
  provide: TAG_REPOSITORY,
  useClass: PostgresTagRepository,
};
const scoringSchemaProvider = {
  provide: SCORING_SCHEMA_REPOSITORY,
  useClass: PostgresScoringSchemaRepository,
};
const gameScoreProvider = {
  provide: GAME_SCORE_REPOSITORY,
  useClass: PostgresGameScoreRepository,
};
const gameProvider = {
  provide: GAME_REPOSITORY,
  useClass: PostgresGameRepository,
};
const setProvider = {
  provide: SET_REPOSITORY,
  useClass: PostgresSetRepository,
};
const translationProvider = {
  provide: TRANSLATION_REPOSITORY,
  useClass: PostgresTranslationRepository,
};

@Module({
  providers: [
    PostgresConnector,
    userProvider,
    roleProvider,
    permissionProvider,
    helperProvider,
    locationProvider,
    tagProvider,
    scoringSchemaProvider,
    gameScoreProvider,
    gameProvider,
    setProvider,
    translationProvider,
  ],
  exports: [
    PostgresConnector,
    userProvider,
    roleProvider,
    permissionProvider,
    helperProvider,
    locationProvider,
    tagProvider,
    scoringSchemaProvider,
    gameScoreProvider,
    gameProvider,
    setProvider,
    translationProvider,
  ],
})
export class DbModule {}
