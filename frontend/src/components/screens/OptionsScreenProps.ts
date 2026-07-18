import type { SelectionType, SelectionStrategy } from "./selection-strategies";

export type OptionProps = {
  label: string;
  value: string;
  action?: string;
  payload?: Record<string, unknown>;
  chosen?: boolean;
};

export const mapOptionToSelectionResult =
  (dataType: SelectionType) => (option: OptionProps) => ({
    value: option.value,
    name: option.label,
    type: dataType,
  });

export type OptionsScreenProps = {
  title: string;
  dataType: SelectionType;
  strategy: SelectionStrategy;
  options: OptionProps[];
};

export type OptionsScreenPropsFull = OptionsScreenProps & {
  frameId: string;
};
