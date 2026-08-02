import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

import { hasSystemCollectionFullPermission } from './has-system-collection-full-permission';

describe('hasSystemCollectionFullPermission', () => {
  it('returns false when SYSTEM_COLLECTION is missing', () => {
    expect(
      hasSystemCollectionFullPermission([
        [PermissionType.GAME_COLLECTIONS, PermissionLevel.FULL],
      ]),
    ).toBe(false);
  });

  it('returns false for SYSTEM_COLLECTION READ', () => {
    expect(
      hasSystemCollectionFullPermission([
        [PermissionType.SYSTEM_COLLECTION, PermissionLevel.READ],
      ]),
    ).toBe(false);
  });

  it('returns true for SYSTEM_COLLECTION FULL', () => {
    expect(
      hasSystemCollectionFullPermission([
        [PermissionType.SYSTEM_COLLECTION, PermissionLevel.FULL],
      ]),
    ).toBe(true);
  });
});
