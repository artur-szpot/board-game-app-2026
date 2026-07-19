import type { FC } from "react";

import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import {
  openSearchFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { SearchScreenProps } from "../screens/SearchScreenProps";
import type { ResultMappingStrategy } from "../screens/selection-strategies";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";
import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";

type FormFieldSearchProps = FormFieldProps & {
  kind: FormFieldType.SEARCH;
  params: SearchScreenProps;
  resultMapping: ResultMappingStrategy;
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
}: {
  name: string;
  label: string;
  params: SearchScreenProps;
  resultMapping: ResultMappingStrategy;
}): FormFieldSearchProps => ({
  kind: FormFieldType.SEARCH,
  label,
  name,
  params,
  resultMapping,
});

export const FormSearchField: FC<FormFieldSearchPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
}: FormFieldSearchPropsFull) => {
  const dispatch = useAppDispatch();
  const chosen = params.currentSelection ?? [];
  return (
    <div className="form-search">
      <label htmlFor={`${name}-find`}>
        {label}
        {chosen.length > 0 &&
          `Chosen: ${chosen.map(selection => selection.name).join(", ")}`}
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
          {chosen.length ? "Change" : "Find"}
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
