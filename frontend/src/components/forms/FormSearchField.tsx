import type { FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import {
  openSearchFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { FormScreenResult } from "../screens/FormScreenProps";
import type { SearchScreenProps } from "../screens/SearchScreenProps";
import type {
  ResultMappingStrategy,
  SelectionResult,
} from "../screens/selection-strategies";
import { FormFieldType } from "./common";
import { DataDisplay } from "./data-displays/DataDisplay";
import type {
  FormFieldSelectionHandlerProps,
  FormFieldSelectionProps,
} from "./selection-field-props";

export type FormFieldSearchProps = FormFieldSelectionProps & {
  kind: FormFieldType.SEARCH;
  params: SearchScreenProps;
};

export type FormFieldSearchPropsFull = FormFieldSearchProps &
  FormFieldSelectionHandlerProps;

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
  onAdditionalStringFieldChange,
  onAdditionalBooleanFieldChange,
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
            <DataDisplay
              key={`${result.type}:${result.value}`}
              item={result}
              removeItem={removeItem}
              onAdditionalStringFieldChange={onAdditionalStringFieldChange}
              onAdditionalBooleanFieldChange={onAdditionalBooleanFieldChange}
            />
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
