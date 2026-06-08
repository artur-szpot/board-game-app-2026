import type { RoleShortDto } from "./role.dto"

export type UserResponseDto = {
  id: string
  username: string
  email: string
  roles: RoleShortDto[]
  joinedDate: string
  lastLogin?: string
}
