export enum SelectionStrategyEnum {
  CHOOSE_ONE,
  SELECT_MULTIPLE,
}

export type SelectionStrategy = {
  strategy: SelectionStrategyEnum;
  min?: number;
  max?: number;
  exact?: number;
};

export const selectionStrategyChooseOne = (): SelectionStrategy => ({
  strategy: SelectionStrategyEnum.CHOOSE_ONE,
});
export const selectionStrategySelectNumber = (values: {
  min?: number;
  max?: number;
  exact?: number;
}): SelectionStrategy => {
  const { min, max, exact } = values;
  // At least one value is set
  if (min === undefined && max === undefined && exact === undefined) {
    throw new Error("At least one value must be set");
  }
  // Exact and min/max are exclusive
  if ((min !== undefined || max !== undefined) && exact !== undefined) {
    throw new Error("Either min/max or exact need to be set, never both");
  }
  // Exact > 0
  if (exact !== undefined && (exact <= 0 || !Number.isInteger(exact))) {
    throw new Error("Exact must be a positive integer");
  }
  // Min >= 0
  if (min !== undefined && (min < 0 || !Number.isInteger(min))) {
    throw new Error("Min must be a positive integer or zero");
  }
  // Max > 0
  if (max !== undefined && (max <= 0 || !Number.isInteger(max))) {
    throw new Error("Max must be a positive integer or zero");
  }
  // Max > Min
  if (max !== undefined && min !== undefined && max <= min) {
    throw new Error(
      "Max must be greater than min (use exact if precise target is known)",
    );
  }
  return {
    strategy: SelectionStrategyEnum.SELECT_MULTIPLE,
    min,
    max,
    exact,
  };
};

export const isConfirmAllowed = (strategy: SelectionStrategy) =>
  strategy.strategy === SelectionStrategyEnum.SELECT_MULTIPLE;

export const isSelectionCorrect = (
  strategy: SelectionStrategy,
  chosenTotal: number,
): boolean => {
  if (strategy.strategy === SelectionStrategyEnum.CHOOSE_ONE) {
    return chosenTotal === 1;
  }
  if (strategy.min !== undefined && chosenTotal < strategy.min) {
    return false;
  }
  if (strategy.max !== undefined && chosenTotal > strategy.max) {
    return false;
  }
  if (strategy.exact !== undefined && chosenTotal !== strategy.exact) {
    return false;
  }
  return true;
};

export type SelectionType =
  | "game"
  | "tag"
  | "location"
  | "helper"
  | "scoring-schema"
  | "game-score"
  | "other";

export type SelectionResult = {
  type: SelectionType;
  value: string;
  name: string;
};
