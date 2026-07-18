import type { FormFieldCheckboxProps } from "../forms/FormCheckboxField";
import type { FormFieldOptionsProps } from "../forms/FormOptionsField";
import type { FormFieldSearchProps } from "../forms/FormSearchField";
import type { FormFieldTextProps } from "../forms/FormTextField";
import type { SelectionResult } from "./selection-strategies";

export type FormScreenValues = {
  stringValues: Record<string, string>;
  booleanValues: Record<string, boolean>;
  selectionValues: Record<string, SelectionResult[]>;
};

export type FormScreenField =
  | FormFieldOptionsProps
  | FormFieldSearchProps
  | FormFieldTextProps
  | FormFieldCheckboxProps;

export type FormScreenProps = {
  title: string;
  fields: FormScreenField[];
};

export type FormScreenPropsFull = FormScreenProps & {
  frameId: string;
};
