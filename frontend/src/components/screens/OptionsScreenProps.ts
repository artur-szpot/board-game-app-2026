import type { GameDataType, SelectionStrategy } from "./selection-strategies";

export type OptionProps = {
  label: string;
  value: string;
  action?: string;
  payload?: Record<string, unknown>;
  chosen?: boolean;
};

export const mapOptionToSelectionResult =
  (dataType: GameDataType) => (option: OptionProps) => ({
    value: option.value,
    name: option.label,
    type: dataType,
  });

export type OptionsScreenProps = {
  title: string;
  dataType: GameDataType;
  strategy: SelectionStrategy;
  correctnessStrategy?: SelectionStrategy;
  options: OptionProps[];
};

export type OptionsScreenPropsFull = OptionsScreenProps & {
  frameId: string;
};
