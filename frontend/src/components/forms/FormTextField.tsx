import { TextField } from "@mui/material";
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
    <TextField
      fullWidth
      id={name}
      name={name}
      label={label}
      type={
        resultMapping === FormTextResultMappingStrategy.NUMBER
          ? "number"
          : "text"
      }
      value={value}
      onChange={onChange}
      slotProps={{
        htmlInput: {
          required,
        },
      }}
    />
  </div>
);
