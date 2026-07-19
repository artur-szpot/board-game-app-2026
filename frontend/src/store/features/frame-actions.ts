import type { FormScreenValues } from "../../components/screens/FormScreenProps";
import type { SelectionResult } from "../../components/screens/selection-strategies";
import type { FrameCallbackContent } from "./frameStackSlice";

export enum ActionEnum {
  CHOICE_MADE = "CHOICE_MADE",
  FORM_FILLED = "FORM_FILLED",
}

export type ChoiceMadeResult = {
  action: ActionEnum.CHOICE_MADE;
  payload: {
    name?: string;
    chosen: SelectionResult[];
  };
};

export type FormFilledResult = {
  action: ActionEnum.FORM_FILLED;
  payload: {
    values: FormScreenValues;
  };
};

export const buildChoiceMadeFromItems = (
  items: SelectionResult[],
  name?: string
): ChoiceMadeResult => ({
  action: ActionEnum.CHOICE_MADE,
  payload: {
    name,
    chosen: items,
  },
});

export const buildFormFilledFromForm = (
  values: FormScreenValues,
): FormFilledResult => ({
  action: ActionEnum.FORM_FILLED,
  payload: { values },
});

export const resultMapper = {
  toChoiceMade: (result: FrameCallbackContent): ChoiceMadeResult => {
    if (result.action !== ActionEnum.CHOICE_MADE) {
      throw new Error(
        `Trying to map ${result.action} to a ${ActionEnum.CHOICE_MADE}`,
      );
    }
    return result as unknown as ChoiceMadeResult;
  },
  toFormFilled: (result: FrameCallbackContent): FormFilledResult => {
    if (result.action !== ActionEnum.FORM_FILLED) {
      throw new Error(
        `Trying to map ${result.action} to a ${ActionEnum.FORM_FILLED}`,
      );
    }
    return result as unknown as FormFilledResult;
  },
};
