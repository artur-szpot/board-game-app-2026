import type { PermissionLevel, PermissionType } from "../../dto/user-data.dto";
import type { FieldValidator } from "./validators";

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
  validators?: FieldValidator[];
  // Supplied at render time by the containing form, never by the field builders.
  showErrors?: boolean;
  errors?: string[];
};

export const hasVisibleErrors = (props: {
  showErrors?: boolean;
  errors?: string[];
}) => Boolean(props.showErrors) && (props.errors?.length ?? 0) > 0;
