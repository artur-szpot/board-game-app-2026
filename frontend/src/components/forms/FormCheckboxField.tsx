import { Checkbox, FormControlLabel } from "@mui/material";
import { type ChangeEvent, type FC } from "react";

import {
    type PermissionLevel,
    type PermissionType,
} from "../../dto/user-data.dto";
import { useHasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import { FormFieldType, hasVisibleErrors, type FormFieldProps } from "./common";
import { FormFieldErrors } from "./FormFieldErrors";

export type FormFieldCheckboxProps = FormFieldProps & {
  kind: FormFieldType.CHECKBOX;
  checked: boolean;
};

export type FormFieldCheckboxPropsFull = FormFieldCheckboxProps & {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const formCheckbox = ({
  name,
  label,
  checked,
  disabled,
  requiredPermissions,
}: {
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  requiredPermissions?: Partial<Record<PermissionType, PermissionLevel>>;
}): FormFieldCheckboxProps => ({
  kind: FormFieldType.CHECKBOX,
  label,
  name,
  checked,
  disabled,
  requiredPermissions,
});

export const FormCheckboxField: FC<FormFieldCheckboxPropsFull> = ({
  name,
  label,
  checked,
  disabled,
  requiredPermissions,
  onChange,
  showErrors,
  errors,
}: FormFieldCheckboxPropsFull) => {
  const hasRequiredPermissions = useHasRequiredPermissions(requiredPermissions);
  const isErrored = hasVisibleErrors({ showErrors, errors });

  return (
    <div className="form-checkbox" hidden={!hasRequiredPermissions}>
      <FormControlLabel
        control={
          <Checkbox
            id={name}
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
        }
        label={label}
        sx={isErrored ? { color: "error.main" } : undefined}
      />
      <FormFieldErrors name={name} showErrors={showErrors} errors={errors} />
    </div>
  );
};
