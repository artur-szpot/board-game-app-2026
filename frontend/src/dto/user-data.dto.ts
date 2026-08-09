export type PermissionType =
  | "USERS"
  | "PERMISSIONS"
  | "ROLES"
  | "GAME_COLLECTIONS"
  | "SYSTEM_COLLECTION"
  | "ADMIN_PANEL";

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
