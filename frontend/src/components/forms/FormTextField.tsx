import type { ChangeEvent, FC } from "react";

import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

export type FormFieldTextProps = FormFieldProps & {
  kind: FormFieldType.TEXT;
  required?: boolean;
  initialValue?: string;
};

export type FormFieldTextPropsFull = FormFieldTextProps & {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
};

export const formText = ({
  name,
  label,
  required,
  initialValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: string;
}): FormFieldTextProps => ({
  kind: FormFieldType.TEXT,
  label,
  name,
  required,
  initialValue,
});

export const FormTextField: FC<FormFieldTextPropsFull> = ({
  name,
  label,
  required = false,
  onChange,
  value,
}: FormFieldTextPropsFull) => (
  <div className="form-text">
    <label htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        required={required}
        onChange={onChange}
      />
    </label>
  </div>
);
