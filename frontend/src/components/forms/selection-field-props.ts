import type { ChangeEvent } from "react";

import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import type { FormScreenResult } from "../screens/FormScreenProps";
import type {
    ResultMappingStrategy,
    SelectionResult,
} from "../screens/selection-strategies";
import type { FormFieldProps } from "./common";

export type FormFieldSelectionProps = FormFieldProps & {
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
};

export type AdditionalFieldChangeReceiver = (
  item: SelectionResult,
  fieldName: string,
  event: ChangeEvent<HTMLInputElement>,
) => void;

export type AdditionalStringFieldChangeReceiver = (
  item: SelectionResult,
  fieldName: string,
  value: string,
) => void;

export type FormFieldSelectionHandlerProps = {
  selectionChangeEmitter: FrameCallbackReceiver;
  currentSelection: SelectionResult[];
  onAdditionalStringFieldChange: AdditionalStringFieldChangeReceiver;
  onAdditionalBooleanFieldChange: AdditionalFieldChangeReceiver;
};
