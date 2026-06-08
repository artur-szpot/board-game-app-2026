import type { PermissionLevel, PermissionShortDto } from "./user-data.dto"

export type PermissionResponseDto = PermissionShortDto & {
  description: string
}
