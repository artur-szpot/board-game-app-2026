import type { PermissionShortDto } from "./user-data.dto"

export type PermissionResponseDto = PermissionShortDto & {
  description: string
}
