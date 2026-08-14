import { FormFieldType } from "../forms/common";
import type { ComparisonValidator, FieldValidator } from "../forms/validators";
import { ValidatorKind } from "../forms/validators";
import type { FormScreenField, FormScreenValues } from "./FormScreenProps";
import type { SelectionStrategy } from "./selection-strategies";
import {
    isSelectionCorrect,
    SelectionStrategyEnum,
} from "./selection-strategies";

export type FormErrors = Record<string, string[]>;

const comparisonDescriptions: Record<ValidatorKind, string> = {
  [ValidatorKind.GREATER_THAN]: "greater than",
  [ValidatorKind.GREATER_THAN_OR_EQUAL]: "greater than or equal to",
  [ValidatorKind.LESSER_THAN]: "lesser than",
  [ValidatorKind.LESSER_THAN_OR_EQUAL]: "lesser than or equal to",
};

const comparisons: Record<
  ValidatorKind,
  (left: number, right: number) => boolean
> = {
  [ValidatorKind.GREATER_THAN]: (left, right) => left > right,
  [ValidatorKind.GREATER_THAN_OR_EQUAL]: (left, right) => left >= right,
  [ValidatorKind.LESSER_THAN]: (left, right) => left < right,
  [ValidatorKind.LESSER_THAN_OR_EQUAL]: (left, right) => left <= right,
};

const requireNumericField = (field: FormScreenField) => {
  if (field.kind !== FormFieldType.NUMERIC) {
    throw new Error(
      `Comparison validators require numeric fields: ${field.name}`,
    );
  }
};

const validateComparison = (
  validator: ComparisonValidator,
  field: FormScreenField,
  values: FormScreenValues,
  fields: FormScreenField[],
): string[] => {
  requireNumericField(field);

  const target = fields.find(other => other.name === validator.otherField);
  if (!target) {
    throw new Error(
      `Unknown field referenced by validator: ${validator.otherField}`,
    );
  }
  requireNumericField(target);

  const value = values.numericValues[field.name];
  const otherValue = values.numericValues[target.name];
  if (value === null || otherValue === null) {
    return [];
  }

  return comparisons[validator.kind](value, otherValue)
    ? []
    : [
        `${field.label} must be ${comparisonDescriptions[validator.kind]} ${target.label}`,
      ];
};

const validateValidator = (
  validator: FieldValidator,
  field: FormScreenField,
  values: FormScreenValues,
  fields: FormScreenField[],
): string[] => {
  switch (validator.kind) {
    case ValidatorKind.GREATER_THAN:
    case ValidatorKind.GREATER_THAN_OR_EQUAL:
    case ValidatorKind.LESSER_THAN:
    case ValidatorKind.LESSER_THAN_OR_EQUAL:
      return validateComparison(validator, field, values, fields);
  }
};

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

const validateFieldKind = (
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

export const validateField = (
  field: FormScreenField,
  values: FormScreenValues,
  fields: FormScreenField[],
): string[] => [
  ...validateFieldKind(field, values),
  ...(field.validators ?? []).flatMap(validator =>
    validateValidator(validator, field, values, fields),
  ),
];

export const validateForm = (
  fields: FormScreenField[],
  values: FormScreenValues,
): FormErrors =>
  Object.fromEntries(
    fields
      .map(field => [field.name, validateField(field, values, fields)] as const)
      .filter(([, errors]) => errors.length > 0),
  );

export const countErrors = (errors: FormErrors): number =>
  Object.values(errors).reduce((total, messages) => total + messages.length, 0);
