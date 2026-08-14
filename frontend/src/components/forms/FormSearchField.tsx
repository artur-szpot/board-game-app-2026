import { Button, Stack, Typography } from "@mui/material";
import type { FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import {
  openSearchFrame,
  sameFrameResult,
} from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import { useHasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import type { FormScreenResult } from "../screens/FormScreenProps";
import type { SearchScreenProps } from "../screens/SearchScreenProps";
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
  validators,
}: {
  name: string;
  label: string;
  params: SearchScreenProps;
  resultMapping: ResultMappingStrategy;
  customMapping?: (item: SelectionResult) => FormScreenResult;
  validators?: FieldValidator[];
}): FormFieldSearchProps => ({
  kind: FormFieldType.SEARCH,
  label,
  name,
  params,
  resultMapping,
  customMapping,
  validators,
});

export const FormSearchField: FC<FormFieldSearchPropsFull> = ({
  name,
  label,
  params,
  selectionChangeEmitter,
  onAdditionalStringFieldChange,
  onAdditionalBooleanFieldChange,
  requiredPermissions,
  showErrors,
  errors,
}: FormFieldSearchPropsFull) => {
  const hasRequiredPermissions = useHasRequiredPermissions(requiredPermissions);
  const isErrored = hasVisibleErrors({ showErrors, errors });

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
    <div className="form-search" hidden={!hasRequiredPermissions}>
      <Stack spacing={1.25}>
        <Typography
          component="p"
          className="form-field-label"
          color={isErrored ? "error" : undefined}
        >
          {label}
        </Typography>
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
        <Button
          fullWidth
          variant="contained"
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
