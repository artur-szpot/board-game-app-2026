import { Checkbox, FormControlLabel } from "@mui/material";
import type { ChangeEvent, FC } from "react";

import { FormFieldType, type FormFieldProps } from "./common";

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
}: {
  name: string;
  label: string;
  checked: boolean;
}): FormFieldCheckboxProps => ({
  kind: FormFieldType.CHECKBOX,
  label,
  name,
  checked,
});

export const FormCheckboxField: FC<FormFieldCheckboxPropsFull> = ({
  name,
  label,
  checked,
  onChange,
}: FormFieldCheckboxPropsFull) => (
  <div className="form-checkbox">
    <FormControlLabel
      control={
        <Checkbox id={name} name={name} checked={checked} onChange={onChange} />
      }
      label={label}
    />
  </div>
);
