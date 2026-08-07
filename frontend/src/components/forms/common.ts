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
};
