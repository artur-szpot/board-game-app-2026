import type { PermissionResponseDto } from "../../dto/permission.dto";
import type { RoleResponseDto } from "../../dto/role.dto";
import type { UserResponseDto } from "../../dto/user.dto";
import type { AdminDataType } from "./admin-data-type.enum";

export type AdminPanelProps = {
  content?: AdminDataType;
};

export type AdminPanelItem =
  | PermissionResponseDto
  | RoleResponseDto
  | UserResponseDto;

export type AdminPanelDetailsByType = {
  [AdminDataType.PERMISSION]: PermissionResponseDto;
  [AdminDataType.ROLE]: RoleResponseDto;
  [AdminDataType.USER]: UserResponseDto;
};
