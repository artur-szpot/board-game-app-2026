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
    <label htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
    </label>
  </div>
);
