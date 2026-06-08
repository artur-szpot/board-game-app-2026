import type { PermissionResponseDto } from "./permission.dto"
import type { PermissionShortDto } from "./user-data.dto"

export type RoleShortDto = {
  id: string
  name: string
  permissions: PermissionShortDto[]
}

export type RoleResponseDto = RoleShortDto & {
  description: string
  protectedRole: boolean
  permissions: PermissionResponseDto[]
}
