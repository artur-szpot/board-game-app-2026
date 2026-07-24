import type { FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import {
  openOptionsFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { FormScreenResult } from "../screens/FormScreenProps";
import {
  mapOptionToSelectionResult,
  type OptionsScreenProps,
} from "../screens/OptionsScreenProps";
import type {
  ResultMappingStrategy,
  SelectionResult,
} from "../screens/selection-strategies";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";
import { DataDisplay } from "./data-displays/DataDisplay";

export type FormFieldOptionsProps = FormFieldProps & {
  kind: FormFieldType.OPTIONS;
  params: OptionsScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
};

export const formOptions = ({
  name,
  label,
  params,
  resultMapping,
  customMapping,
}: {
  name: string;
  label: string;
  params: OptionsScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
}): FormFieldOptionsProps => ({
  kind: FormFieldType.OPTIONS,
  label,
  name,
  params,
  resultMapping,
  customMapping,
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
  const removeItem = (selected: SelectionResult) =>
    dispatch(
      sameFrameResult({
        result: buildChoiceMadeFromItems(
          chosen
            .filter(item => item.value !== selected.value)
            .map(mapOptionToSelectionResult(selected.type)),
          name,
        ),
      }),
    );

  return (
    <div className="form-options">
      <label htmlFor={name}>
        {label}
        {chosen.length > 0 &&
          chosen.map(option => (
            <DataDisplay
              key={option.value}
              item={mapOptionToSelectionResult(params.dataType)(option)}
              removeItem={removeItem}
            />
          ))}
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
