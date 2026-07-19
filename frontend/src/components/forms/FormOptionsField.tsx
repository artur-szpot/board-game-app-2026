import type { FC } from "react";

import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import {
  openOptionsFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { OptionsScreenProps } from "../screens/OptionsScreenProps";
import type { ResultMappingStrategy } from "../screens/selection-strategies";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";
import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";

export type FormFieldOptionsProps = FormFieldProps & {
  kind: FormFieldType.OPTIONS;
  params: OptionsScreenProps;
  resultMapping: ResultMappingStrategy;
};

export const formOptions = ({
  name,
  label,
  params,
  resultMapping,
}: {
  name: string;
  label: string;
  params: OptionsScreenProps;
  resultMapping: ResultMappingStrategy;
}): FormFieldOptionsProps => ({
  kind: FormFieldType.OPTIONS,
  label,
  name,
  params,
  resultMapping,
});

export type FormFieldOptionsPropsFull = FormFieldOptionsProps & {
  selectionChangeEmitter: FrameCallbackReceiver;
};

export const FormOptionsField: FC<FormFieldOptionsPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
}: FormFieldOptionsPropsFull) => {
  const dispatch = useAppDispatch();
  const chosen = params.options.filter(option => option.chosen);
  return (
    <div className="form-options">
      <label htmlFor={name}>
        {label}
        {chosen.length > 0 &&
          `Chosen: ${chosen.map(option => option.label).join(", ")}`}
        <button
          type="button"
          onClick={() =>
            dispatch(
              openOptionsFrame({
                params,
                callbackEmitter: selectionChangeEmitter,
              }),
            )
          }
        >
          {chosen.length ? "Change" : "Choose"}
        </button>
      </label>
      {chosen.length > 0 && (
        <label htmlFor={`${name}-clear`}>
          <button
            type="button"
            onClick={() =>
              dispatch(
                sameFrameResult({ result: buildChoiceMadeFromItems([], name) }),
              )
            }
          >
            {"Clear"}
          </button>
        </label>
      )}
    </div>
  );
};
