import type { PermissionResponseDto, PermissionShortDto } from "./permission.dto"

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
