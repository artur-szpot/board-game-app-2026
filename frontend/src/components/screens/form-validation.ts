import { FormFieldType } from "../forms/common";
import type { FormScreenField, FormScreenValues } from "./FormScreenProps";
import type { SelectionStrategy } from "./selection-strategies";
import {
    isSelectionCorrect,
    SelectionStrategyEnum,
} from "./selection-strategies";

export type FormErrors = Record<string, string[]>;

export const describeSelectionStrategy = (
  strategy: SelectionStrategy,
): string => {
  if (strategy.strategy === SelectionStrategyEnum.CHOOSE_ONE) {
    return "choose exactly one option";
  }
  if (strategy.exact !== undefined) {
    return `select exactly ${strategy.exact.toString()}`;
  }
  const parts: string[] = [];
  if (strategy.min !== undefined) {
    parts.push(`at least ${strategy.min.toString()}`);
  }
  if (strategy.max !== undefined) {
    parts.push(`at most ${strategy.max.toString()}`);
  }
  return parts.length
    ? `select ${parts.join(" and ")}`
    : "selection is invalid";
};

export const validateField = (
  field: FormScreenField,
  values: FormScreenValues,
): string[] => {
  switch (field.kind) {
    case FormFieldType.CHECKBOX:
      return [];
    case FormFieldType.TEXT:
      return field.required && !values.stringValues[field.name]
        ? [`${field.label} is required`]
        : [];
    case FormFieldType.NUMERIC:
      return field.required && values.numericValues[field.name] === null
        ? [`${field.label} is required`]
        : [];
    case FormFieldType.OPTIONS:
    case FormFieldType.SEARCH: {
      const strategy =
        field.params.correctnessStrategy ?? field.params.strategy;
      const chosenTotal = (values.selectionValues[field.name] ?? []).length;
      return isSelectionCorrect(strategy, chosenTotal)
        ? []
        : [`${field.label}: ${describeSelectionStrategy(strategy)}`];
    }
    default:
      return [];
  }
};

export const validateForm = (
  fields: FormScreenField[],
  values: FormScreenValues,
): FormErrors =>
  Object.fromEntries(
    fields
      .map(field => [field.name, validateField(field, values)] as const)
      .filter(([, errors]) => errors.length > 0),
  );

export const countErrors = (errors: FormErrors): number =>
  Object.values(errors).reduce((total, messages) => total + messages.length, 0);
