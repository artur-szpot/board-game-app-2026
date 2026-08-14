export enum ValidatorKind {
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESSER_THAN = "LESSER_THAN",
  LESSER_THAN_OR_EQUAL = "LESSER_THAN_OR_EQUAL",
}

export type ComparisonValidator = {
  kind: ValidatorKind;
  otherField: string;
};

export type FieldValidator = ComparisonValidator;

const comparisonValidator =
  (kind: ValidatorKind) =>
  (otherField: string): ComparisonValidator => ({ kind, otherField });

export const isGreaterThan = comparisonValidator(ValidatorKind.GREATER_THAN);
export const isGreaterThanOrEqual = comparisonValidator(
  ValidatorKind.GREATER_THAN_OR_EQUAL,
);
export const isLesserThan = comparisonValidator(ValidatorKind.LESSER_THAN);
export const isLesserThanOrEqual = comparisonValidator(
  ValidatorKind.LESSER_THAN_OR_EQUAL,
);
