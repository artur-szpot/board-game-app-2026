import type { ChangeEvent, FC } from "react";

import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

export enum FormTextResultMappingStrategy {
  STRING = "STRING",
  NUMBER = "NUMBER",
}

export type FormFieldTextProps = FormFieldProps & {
  kind: FormFieldType.TEXT;
  required?: boolean;
  initialValue?: string;
  resultMapping: FormTextResultMappingStrategy;
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
  resultMapping: FormTextResultMappingStrategy.STRING,
});

export const formNumber = ({
  name,
  label,
  required,
  initialValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: number;
}): FormFieldTextProps => ({
  kind: FormFieldType.TEXT,
  label,
  name,
  required,
  initialValue: initialValue?.toString(),
  resultMapping: FormTextResultMappingStrategy.NUMBER,
});

export const FormTextField: FC<FormFieldTextPropsFull> = ({
  name,
  label,
  required = false,
  resultMapping,
  onChange,
  value,
}: FormFieldTextPropsFull) => (
  <div className="form-text">
    <label htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type={
          resultMapping === FormTextResultMappingStrategy.NUMBER
            ? "number"
            : "text"
        }
        value={value}
        required={required}
        onChange={onChange}
      />
    </label>
  </div>
);
