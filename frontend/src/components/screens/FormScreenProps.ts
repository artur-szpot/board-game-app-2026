import { FormFieldType } from "../forms/common";
import type { FormFieldCheckboxProps } from "../forms/FormCheckboxField";
import type { FormFieldOptionsProps } from "../forms/FormOptionsField";
import type FormFieldSearchProps from "../forms/FormSearchField";
import type { FormFieldTextProps } from "../forms/FormTextField";
import type { SelectionResult } from "./selection-strategies";
import { ResultMappingStrategy } from "./selection-strategies";

export type FormScreenValues = {
  stringValues: Record<string, string>;
  booleanValues: Record<string, boolean>;
  selectionValues: Record<string, SelectionResult[]>;
};

export type FormScreenResults = Record<
  string,
  | string
  | boolean
  | string[]
  | Omit<SelectionResult, "name">
  | Omit<SelectionResult, "name">[]
>;

export const mapFormValuesToResults = (
  values: FormScreenValues,
  fields: FormScreenField[],
): FormScreenResults => {
  const mapped: FormScreenResults = {};
  Object.entries(values.stringValues).forEach(
    ([name, value]) => (mapped[name] = value),
  );
  Object.entries(values.booleanValues).forEach(
    ([name, value]) => (mapped[name] = value),
  );
  Object.entries(values.selectionValues).forEach(([name, values]) => {
    switch (
      fields
        .filter(
          field =>
            field.kind === FormFieldType.OPTIONS ||
            field.kind === FormFieldType.SEARCH,
        )
        .find(field => field.name === name)?.resultMapping
    ) {
      case undefined:
        throw new Error(
          "Something went wrong while mapping form values to results",
        );
      case ResultMappingStrategy.VALUES_ONLY:
        mapped[name] = values.map(value => value.value);
        break;
      case ResultMappingStrategy.VALUES_AND_TYPES:
        mapped[name] = values.map(value => ({
          value: value.value,
          type: value.type,
        }));
        break;
      case ResultMappingStrategy.SINGLE_VALUE_ONLY:
        if (values.length > 0) {
          mapped[name] = values.map(value => value.value)[0];
        }
        break;
      case ResultMappingStrategy.SINGLE_VALUE_AND_TYPE:
        if (values.length > 0) {
          mapped[name] = values.map(value => ({
            value: value.value,
            type: value.type,
          }))[0];
        }
        break;
    }
  });
  return mapped;
};

export type FormScreenField =
  | FormFieldOptionsProps
  | FormFieldSearchProps
  | FormFieldTextProps
  | FormFieldCheckboxProps;

export type FormScreenProps = {
  title: string;
  fields: FormScreenField[];
  action: string;
  method: "POST" | "PATCH";
};

export type FormScreenPropsFull = FormScreenProps & {
  frameId: string;
};
