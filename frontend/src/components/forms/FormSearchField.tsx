import type { FC } from "react";

import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import { openSearchFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { SearchScreenProps } from "../screens/SearchScreenProps";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

export type FormFieldSearchProps = FormFieldProps & {
  kind: FormFieldType.SEARCH;
  params: SearchScreenProps;
};

export type FormFieldSearchPropsFull = FormFieldSearchProps & {
  selectionChangeEmitter: FrameCallbackReceiver;
};

export const formSearch = ({
  name,
  label,
  params,
}: {
  name: string;
  label: string;
  params: SearchScreenProps;
}): FormFieldSearchProps => ({
  kind: FormFieldType.SEARCH,
  label,
  name,
  params,
});

export const FormSearchField: FC<FormFieldSearchPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
}: FormFieldSearchPropsFull) => {
  const dispatch = useAppDispatch();
  return (
    <div className="form-search">
      <label htmlFor={name}>
        {label}
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
          {"Search for options"}
        </button>
      </label>
    </div>
  );
};
