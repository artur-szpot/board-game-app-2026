export enum PermissionType {
  "USERS" = "USERS",
  "PERMISSIONS" = "PERMISSIONS",
  "ROLES" = "ROLES",
  "GAME_COLLECTIONS" = "GAME_COLLECTIONS",
  "SYSTEM_COLLECTION" = "SYSTEM_COLLECTION",
  "ADMIN_PANEL" = "ADMIN_PANEL",
}

export enum PermissionLevel {
  READ = "READ",
  FULL = "FULL",
}

export const PermissionPrecedence = [
  undefined,
  PermissionLevel.READ,
  PermissionLevel.FULL,
];

export type PermissionShortDto = {
  permissionType: PermissionType;
  permissionLevel?: PermissionLevel;
};

export type UserDataDto = {
  id: string;
  username: string;
  permissions: PermissionShortDto[];
};
