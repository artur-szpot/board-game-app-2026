import type { FrameProps } from "../../store/features/frame-actions";
import type {
  GameDataType,
  SelectionScreenProps,
} from "./selection-strategies";

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

export type OptionsScreenProps = SelectionScreenProps & {
  dataType: GameDataType;
  options: OptionProps[];
};

export type OptionsScreenPropsFull = OptionsScreenProps & FrameProps;
