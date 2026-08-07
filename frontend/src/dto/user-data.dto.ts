export type PermissionType =
  | "USERS"
  | "PERMISSIONS"
  | "ROLES"
  | "GAME_COLLECTIONS"
  | "SYSTEM_COLLECTION"
  | "ADMIN_PANEL";

export type PermissionLevel = "READ" | "FULL";

export type PermissionShortDto = {
  permissionType: PermissionType;
  permissionLevel?: PermissionLevel;
};

export type UserDataDto = {
  id: string;
  username: string;
  permissions: PermissionShortDto[];
};
