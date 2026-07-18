export enum FormFieldType {
  TEXT,
  SEARCH,
  OPTIONS,
  CHECKBOX,
}

export type FormFieldProps = {
  name: string;
  label: string;
};