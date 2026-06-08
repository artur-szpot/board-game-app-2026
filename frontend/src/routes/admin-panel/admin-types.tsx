import type { PermissionResponseDto } from "../../dto/permission.dto"
import type { RoleResponseDto } from "../../dto/role.dto"
import type { UserResponseDto } from "../../dto/user.dto"

export type AdminPanelCategory = "permissions" | "roles" | "users"

export type AdminPanelProps = {
  content?: AdminPanelCategory
}

export const PAGE_SIZE = 10

export type AdminPanelItem =
  | PermissionResponseDto
  | RoleResponseDto
  | UserResponseDto

export type PaginatedResponse<T> = {
  page: T[]
  total: number
}
