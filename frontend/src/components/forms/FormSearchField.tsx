import type { FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import {
  openSearchFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { FormScreenResult } from "../screens/FormScreenProps";
import type { SearchScreenProps } from "../screens/SearchScreenProps";
import type {
  ResultMappingStrategy,
  SelectionResult
} from "../screens/selection-strategies";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";
import { DataDisplay } from "./data-displays/DataDisplay";

type FormFieldSearchProps = FormFieldProps & {
  kind: FormFieldType.SEARCH;
  params: SearchScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
};
export default FormFieldSearchProps;

export type FormFieldSearchPropsFull = FormFieldSearchProps & {
  selectionChangeEmitter: FrameCallbackReceiver;
};

export const formSearch = ({
  name,
  label,
  params,
  resultMapping,
  customMapping,
}: {
  name: string;
  label: string;
  params: SearchScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
}): FormFieldSearchProps => ({
  kind: FormFieldType.SEARCH,
  label,
  name,
  params,
  resultMapping,
  customMapping,
});

export const FormSearchField: FC<FormFieldSearchPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
}: FormFieldSearchPropsFull) => {
  const dispatch = useAppDispatch();
  const chosen = params.currentSelection ?? [];
  const removeItem = (selected: SelectionResult) => {
    dispatch(
      sameFrameResult({
        result: buildChoiceMadeFromItems(
          chosen.filter(item => item.value !== selected.value),
          name,
        ),
      }),
    );
  };

  return (
    <div className="form-search">
      <label htmlFor={`${name}-find`}>
        {label}
        {chosen.length > 0 &&
          chosen.map(result => (
            <DataDisplay key={result.value} item={result} removeItem={removeItem} />
          ))}
        <button
          type="button"
          onClick={() =>
            dispatch(
              openSearchFrame({
                params,
                callbackEmitter: selectionChangeEmitter,
              }),
            )
          }
        >
          {chosen.length ? "Change" : "Search for options"}
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
