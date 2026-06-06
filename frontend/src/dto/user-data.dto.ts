export type PermissionType =
  | 'USERS'
  | 'PERMISSIONS'
  | 'ROLES'
  | 'GAME_COLLECTIONS'
  | 'ADMIN_PANEL'

export type PermissionLevel = 'READ' | 'FULL'

export type PermissionShortDto = {
  permissionType: PermissionType
  permissionLevel?: PermissionLevel
}

export type UserDataDto = {
  username: string
  permissions: PermissionShortDto[]
}
