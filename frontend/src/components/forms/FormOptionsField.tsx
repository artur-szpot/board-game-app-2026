import type { FC } from "react";

import type { FrameCallbackReceiver } from "../../store/features/frameStackSlice";
import { openOptionsFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import type { OptionsScreenProps } from "../screens/OptionsScreenProps";
import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

export type FormFieldOptionsProps = FormFieldProps & {
  kind: FormFieldType.OPTIONS;
  params: OptionsScreenProps;
};

export const formOptions = ({
  name,
  label,
  params,
}: {
  name: string;
  label: string;
  params: OptionsScreenProps;
}): FormFieldOptionsProps => ({
  kind: FormFieldType.OPTIONS,
  label,
  name,
  params,
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
    </div>
  );
};
