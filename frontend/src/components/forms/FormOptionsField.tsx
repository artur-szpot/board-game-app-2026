import { Button, Stack, Typography } from "@mui/material";
import type { FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import {
  openOptionsFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import { useHasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import type { FormScreenResult } from "../screens/FormScreenProps";
import { type OptionsScreenProps } from "../screens/OptionsScreenProps";
import type {
  ResultMappingStrategy,
  SelectionResult,
} from "../screens/selection-strategies";
import { FormFieldType, hasVisibleErrors } from "./common";
import { DataDisplay } from "./data-displays/DataDisplay";
import { FormFieldErrors } from "./FormFieldErrors";
import type {
  FormFieldSelectionHandlerProps,
  FormFieldSelectionProps,
} from "./selection-field-props";
import type { FieldValidator } from "./validators";

export type FormFieldOptionsProps = FormFieldSelectionProps & {
  kind: FormFieldType.OPTIONS;
  params: OptionsScreenProps;
};

export const formOptions = ({
  name,
  label,
  params,
  resultMapping,
  customMapping,
  validators,
}: {
  name: string;
  label: string;
  params: OptionsScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
  validators?: FieldValidator[];
}): FormFieldOptionsProps => ({
  kind: FormFieldType.OPTIONS,
  label,
  name,
  params,
  resultMapping,
  customMapping,
  validators,
});

export type FormFieldOptionsPropsFull = FormFieldOptionsProps &
  FormFieldSelectionHandlerProps;

export const FormOptionsField: FC<FormFieldOptionsPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
  currentSelection,
  onAdditionalStringFieldChange,
  onAdditionalBooleanFieldChange,
  requiredPermissions,
  showErrors,
  errors,
}: FormFieldOptionsPropsFull) => {
  const hasRequiredPermissions = useHasRequiredPermissions(requiredPermissions);
  const isErrored = hasVisibleErrors({ showErrors, errors });

  const dispatch = useAppDispatch();
  const chosen = currentSelection;
  const removeItem = (selected: SelectionResult) =>
    dispatch(
      sameFrameResult({
        result: buildChoiceMadeFromItems(
          chosen.filter(
            item =>
              !(item.type === selected.type && item.value === selected.value),
          ),
          name,
        ),
      }),
    );

  return (
    <div className="form-options" hidden={!hasRequiredPermissions}>
      <Stack spacing={1.25}>
        <Typography
          component="p"
          className="form-field-label"
          color={isErrored ? "error" : undefined}
        >
          {label}
        </Typography>
        {chosen.length > 0 &&
          chosen.map(selected => (
            <DataDisplay
              key={`${selected.type}:${selected.value}`}
              item={selected}
              removeItem={removeItem}
              onAdditionalStringFieldChange={onAdditionalStringFieldChange}
              onAdditionalBooleanFieldChange={onAdditionalBooleanFieldChange}
            />
          ))}
        <Button
          fullWidth
          variant="contained"
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
        </Button>
      </Stack>
      {chosen.length > 0 && (
        <Button
          fullWidth
          variant="text"
          color="inherit"
          type="button"
          onClick={() =>
            dispatch(
              sameFrameResult({ result: buildChoiceMadeFromItems([], name) }),
            )
          }
        >
          {"Clear"}
        </Button>
      )}
      <FormFieldErrors name={name} showErrors={showErrors} errors={errors} />
    </div>
  );
};
