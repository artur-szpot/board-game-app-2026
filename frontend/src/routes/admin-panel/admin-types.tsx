import type { PermissionResponseDto } from "../../dto/permission.dto"
import type { RoleResponseDto } from "../../dto/role.dto"
import type { UserResponseDto } from "../../dto/user.dto"

export type AdminPanelCategory = "permissions" | "roles" | "users"

export type AdminPanelProps = {
  content?: AdminPanelCategory
}

export type AdminPanelItem =
  | PermissionResponseDto
  | RoleResponseDto
  | UserResponseDto
