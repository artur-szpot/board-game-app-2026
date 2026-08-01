import type { FrameProps } from "../../store/features/frame-actions";
import { FormFieldType } from "../forms/common";
import type { FormFieldCheckboxProps } from "../forms/FormCheckboxField";
import type { FormFieldOptionsProps } from "../forms/FormOptionsField";
import type { FormFieldSearchProps } from "../forms/FormSearchField";
import {
  FormTextResultMappingStrategy,
  type FormFieldTextProps,
} from "../forms/FormTextField";
import type { SelectionResult } from "./selection-strategies";
import { ResultMappingStrategy } from "./selection-strategies";

export type FormScreenValues = {
  stringValues: Record<string, string>;
  booleanValues: Record<string, boolean>;
  selectionValues: Record<string, SelectionResult[]>;
};

export type FormScreenResult = string | number | boolean | object;

export type FormFieldCustomMappings = Record<
  string,
  (item: SelectionResult) => FormScreenResult
>;

export type FormScreenResults = Record<
  string,
  FormScreenResult | FormScreenResult[]
>;

export const mapFormValuesToResults = (
  values: FormScreenValues,
  fields: FormScreenField[],
  customMappings?: FormFieldCustomMappings,
): FormScreenResults => {
  const mapped: FormScreenResults = {};
  fields
    .filter(
      (field): field is FormFieldTextProps => field.kind === FormFieldType.TEXT,
    )
    .forEach(field => {
      const value = values.stringValues[field.name];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (value === undefined) {
        return;
      }
      switch (field.resultMapping) {
        case FormTextResultMappingStrategy.NUMBER:
          mapped[field.name] = value.trim().length > 0 ? Number(value) : 0;
          break;
        case FormTextResultMappingStrategy.STRING:
        default:
          mapped[field.name] = value;
          break;
      }
    });
  Object.entries(values.booleanValues).forEach(
    ([name, value]) => (mapped[name] = value),
  );
  Object.entries(values.selectionValues).forEach(([name, values]) => {
    const field = fields
      .filter(
        field =>
          field.kind === FormFieldType.OPTIONS ||
          field.kind === FormFieldType.SEARCH,
      )
      .find(field => field.name === name);
    if (!field) {
      throw new Error(
        "Something went wrong while mapping form values to results",
      );
    }
    switch (field.resultMapping) {
      case ResultMappingStrategy.CUSTOM:
        {
          const customMapping = customMappings?.[name] ?? field.customMapping;
          if (!customMapping) {
            throw new Error(
              "Expected custom mapping logic, but it was not present",
            );
          }
          mapped[name] = values.map(customMapping);
        }
        break;
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

export type FormScreenPropsFull = FormScreenProps & FrameProps;

export const getCustomMappingFromField = (
  field: FormScreenField,
): ((item: SelectionResult) => FormScreenResult) | undefined => {
  if (
    (field.kind === FormFieldType.SEARCH ||
      field.kind === FormFieldType.OPTIONS) &&
    field.resultMapping === ResultMappingStrategy.CUSTOM
  ) {
    return field.customMapping;
  }
  return undefined;
};

export const withCustomMappingRemoved = (
  field: FormScreenField,
): FormScreenField => {
  if (
    field.kind !== FormFieldType.SEARCH &&
    field.kind !== FormFieldType.OPTIONS
  ) {
    return field;
  }

  const { customMapping, ...serializableField } = field;
  return serializableField;
};
