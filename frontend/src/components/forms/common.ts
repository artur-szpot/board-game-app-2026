import type { PermissionLevel, PermissionType } from "../../dto/user-data.dto";

export enum FormFieldType {
  TEXT,
  NUMERIC,
  SEARCH,
  OPTIONS,
  CHECKBOX,
}

export type FormFieldProps = {
  name: string;
  label: string;
  requiredPermissions?: Partial<Record<PermissionType, PermissionLevel>>;
  disabled?: boolean;
};
