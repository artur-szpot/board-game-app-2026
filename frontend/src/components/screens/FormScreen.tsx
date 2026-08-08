import { Paper, Stack, Typography } from "@mui/material";
import axios from "axios";
import type { ChangeEvent, FC } from "react";
import { useCallback, useEffect, useState } from "react";

import { selectAccessToken } from "../../store/features/currentUserSlice";
import { getFormScreenCustomMappings } from "../../store/features/formScreenCustomMappingRegistry";
import { resultMapper } from "../../store/features/frame-actions";
import type {
    FrameCallbackContent,
    FrameCallbackReceiver,
} from "../../store/features/frameStackSlice";
import {
    addCallbackReceiverToTopFrame,
    closeFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FormFieldType } from "../forms/common";
import { FormCheckboxField } from "../forms/FormCheckboxField";
import { FormFieldNumericInput } from "../forms/FormFieldNumericInput";
import { FormOptionsField } from "../forms/FormOptionsField";
import { FormSearchField } from "../forms/FormSearchField";
import { FormTextField } from "../forms/FormTextField";
import { MainActions } from "../MainActions";
import {
    mapFormValuesToResults,
    type FormScreenField,
    type FormScreenPropsFull,
    type FormScreenValues,
} from "./FormScreenProps";
import {
    isSameSelectionResult,
    isSelectionCorrect,
    type SelectionResult,
    type SelectionScreenProps,
} from "./selection-strategies";

const formScreenDraftCache = new Map<string, FormScreenValues>();

const withSelectionAdditionalFields = (
  selected: SelectionResult,
  additionalFields: SelectionScreenProps["additionalFields"] | undefined,
  previousSelectionValues: SelectionResult[],
): SelectionResult => {
  const previous = previousSelectionValues.find(item =>
    isSameSelectionResult(item, selected),
  );

  const additionalStringFieldConfigs = Object.fromEntries(
    (additionalFields ?? [])
      .filter(field => field.kind === FormFieldType.TEXT)
      .map(field => [field.name, field]),
  );
  const additionalBooleanFieldConfigs = Object.fromEntries(
    (additionalFields ?? [])
      .filter(field => field.kind === FormFieldType.CHECKBOX)
      .map(field => [field.name, field]),
  );

  return {
    ...selected,
    additionalStringFieldConfigs,
    additionalBooleanFieldConfigs,
    additionalStringFields: Object.fromEntries(
      Object.entries(additionalStringFieldConfigs).map(([fieldName, field]) => [
        fieldName,
        previous?.additionalStringFields?.[fieldName] ??
          field.initialValue ??
          "",
      ]),
    ),
    additionalBooleanFields: Object.fromEntries(
      Object.entries(additionalBooleanFieldConfigs).map(
        ([fieldName, field]) => [
          fieldName,
          previous?.additionalBooleanFields?.[fieldName] ?? field.checked,
        ],
      ),
    ),
  };
};

const buildInitialStringValues = (fields: FormScreenField[]) =>
  Object.fromEntries(
    fields
      .filter(field => field.kind === FormFieldType.TEXT)
      .map(field => [field.name, field.initialValue ?? ""]),
  );

const buildInitialNumericValues = (fields: FormScreenField[]) =>
  Object.fromEntries(
    fields
      .filter(field => field.kind === FormFieldType.NUMERIC)
      .map(field => [field.name, field.initialValue ?? null]),
  );

const buildInitialBooleanValues = (fields: FormScreenField[]) =>
  Object.fromEntries(
    fields
      .filter(field => field.kind === FormFieldType.CHECKBOX)
      .map(field => [field.name, field.checked]),
  );

const buildInitialSelectionValues = (fields: FormScreenField[]) =>
  Object.fromEntries([
    ...fields
      .filter(field => field.kind === FormFieldType.OPTIONS)
      .map((field): [string, SelectionResult[]] => [
        field.name,
        field.params.options
          .filter(option => option.chosen)
          .map(option =>
            withSelectionAdditionalFields(
              {
                type: field.params.dataType,
                value: option.value,
                name: option.label,
              },
              field.params.additionalFields,
              [],
            ),
          ),
      ]),
    ...fields
      .filter(field => field.kind === FormFieldType.SEARCH)
      .map((field): [string, SelectionResult[]] => [
        field.name,
        (field.params.currentSelection ?? []).map(selected =>
          withSelectionAdditionalFields(
            selected,
            field.params.additionalFields,
            field.params.currentSelection ?? [],
          ),
        ),
      ]),
  ] as [string, SelectionResult[]][]);

export const FormScreen: FC<FormScreenPropsFull> = ({
  frameId,
  title,
  fields,
  action,
  method,
}: FormScreenPropsFull) => {
  const accessToken = useAppSelector(selectAccessToken);
  const draft = formScreenDraftCache.get(frameId);

  const [stringValues, setStringValues] = useState<Record<string, string>>(
    draft?.stringValues ?? buildInitialStringValues(fields),
  );
  const [numericValues, setNumericValues] = useState<
    Record<string, number | null>
  >(draft?.numericValues ?? buildInitialNumericValues(fields));
  const [booleanValues, setBooleanValues] = useState<Record<string, boolean>>(
    draft?.booleanValues ?? buildInitialBooleanValues(fields),
  );
  const [selectionValues, setSelectionValues] = useState<
    Record<string, SelectionResult[]>
  >(draft?.selectionValues ?? buildInitialSelectionValues(fields));

  // Initialize cache entry on mount
  useEffect(() => {
    if (!formScreenDraftCache.has(frameId)) {
      formScreenDraftCache.set(frameId, {
        stringValues,
        numericValues,
        booleanValues,
        selectionValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameId]);

  const updateStringValue = (name: string, value: string) => {
    setStringValues(current => {
      const next = { ...current, [name]: value };
      formScreenDraftCache.set(frameId, {
        stringValues: next,
        numericValues,
        booleanValues,
        selectionValues,
      });
      return next;
    });
  };

  const updateNumericValue = (name: string, value: number | null) => {
    setNumericValues(current => {
      const next = { ...current, [name]: value };
      formScreenDraftCache.set(frameId, {
        stringValues,
        numericValues: next,
        booleanValues,
        selectionValues,
      });
      return next;
    });
  };

  const handleStringChange =
    (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
      updateStringValue(name, event.target.value);
    };

  const handleBooleanChange =
    (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setBooleanValues(current => {
        const next = {
          ...current,
          [name]: event.target.checked,
        };
        formScreenDraftCache.set(frameId, {
          stringValues,
          numericValues,
          booleanValues: next,
          selectionValues,
        });
        return next;
      });
    };

  const handleAdditionalStringFieldChange =
    (fieldName: string, item: SelectionResult, additionalFieldName: string) =>
    (nextValue: string) => {
      setSelectionValues(current => {
        const currentFieldSelections = current[fieldName] ?? [];
        const nextFieldSelections = currentFieldSelections.map(selection => {
          if (!isSameSelectionResult(selection, item)) {
            return selection;
          }
          return {
            ...selection,
            additionalStringFields: {
              ...(selection.additionalStringFields ?? {}),
              [additionalFieldName]: nextValue,
            },
          };
        });
        const nextSelectionValues = {
          ...current,
          [fieldName]: nextFieldSelections,
        };
        formScreenDraftCache.set(frameId, {
          stringValues,
          numericValues,
          booleanValues,
          selectionValues: nextSelectionValues,
        });
        return nextSelectionValues;
      });
    };

  const handleAdditionalBooleanFieldChange =
    (fieldName: string, item: SelectionResult, additionalFieldName: string) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.checked;
      setSelectionValues(current => {
        const currentFieldSelections = current[fieldName] ?? [];
        const nextFieldSelections = currentFieldSelections.map(selection => {
          if (!isSameSelectionResult(selection, item)) {
            return selection;
          }
          return {
            ...selection,
            additionalBooleanFields: {
              ...(selection.additionalBooleanFields ?? {}),
              [additionalFieldName]: nextValue,
            },
          };
        });
        const nextSelectionValues = {
          ...current,
          [fieldName]: nextFieldSelections,
        };
        formScreenDraftCache.set(frameId, {
          stringValues,
          numericValues,
          booleanValues,
          selectionValues: nextSelectionValues,
        });
        return nextSelectionValues;
      });
    };

  const selectionChangeReceiver = useCallback(
    (name?: string): FrameCallbackReceiver =>
      (result: FrameCallbackContent) => {
        const mapped = resultMapper.toChoiceMade(result);
        const resolvedName = name ?? mapped.payload.name;
        if (resolvedName === undefined) {
          throw new Error(
            "No name associated with the received choice made result",
          );
        }

        const targetField = fields
          .filter(
            field =>
              field.kind === FormFieldType.OPTIONS ||
              field.kind === FormFieldType.SEARCH,
          )
          .find(field => field.name === resolvedName);
        if (!targetField) {
          throw new Error(
            `Received selection change for unknown field: ${resolvedName}`,
          );
        }

        const cachedDraft = formScreenDraftCache.get(frameId);
        if (!cachedDraft) {
          throw new Error("No cached draft found for this frame");
        }
        const existingForField =
          cachedDraft.selectionValues[resolvedName] ?? [];
        const chosen = mapped.payload.chosen.map(choice =>
          withSelectionAdditionalFields(
            { ...choice },
            targetField.params.additionalFields,
            existingForField,
          ),
        );
        const cachedNext = {
          ...cachedDraft,
          selectionValues: {
            ...cachedDraft.selectionValues,
            [resolvedName]: chosen,
          },
        };
        formScreenDraftCache.set(frameId, cachedNext);

        setSelectionValues(current => ({
          ...current,
          [resolvedName]: chosen,
        }));
      },
    [fields, frameId],
  );

  const isFieldOk = (field: FormScreenField) => {
    switch (field.kind) {
      case FormFieldType.CHECKBOX:
        return true;
      case FormFieldType.TEXT:
        return !field.required || stringValues[field.name].length;
      case FormFieldType.NUMERIC:
        return !field.required || numericValues[field.name] !== null;
      case FormFieldType.OPTIONS:
      case FormFieldType.SEARCH:
        return isSelectionCorrect(
          field.params.correctnessStrategy ?? field.params.strategy,
          selectionValues[field.name].length,
        );
      default:
        return false;
    }
  };
  const isConfirmEnabled = () => fields.every(isFieldOk);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(addCallbackReceiverToTopFrame(selectionChangeReceiver()));
  }, [frameId, dispatch, selectionChangeReceiver]);

  const dispatchResults = async (_values: FormScreenValues) => {
    const result = mapFormValuesToResults(
      _values,
      fields,
      getFormScreenCustomMappings(frameId),
    );
    try {
      await axios({
        method,
        url: `${import.meta.env.VITE_API_URL as string}/${action}`,
        data: result,
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      });
    } catch (error) {
      // TODO: make pretty error display
      alert(error instanceof Error ? error.message : String(error));
      return;
    }
    // TODO: display a success message
    formScreenDraftCache.delete(frameId);
    dispatch(
      closeFrame({
        id: frameId,
      }),
    );
  };

  return (
    <div className="form-screen">
      <section aria-label="form screen" className="form-screen-section">
        <Paper className="form-screen-card" elevation={8}>
          <Stack spacing={2.5}>
            <Typography component="h2" variant="h5">
              {title}
            </Typography>
            {Object.values(fields).map(field => {
              switch (field.kind) {
                case FormFieldType.TEXT:
                  return (
                    <FormTextField
                      key={field.name}
                      {...field}
                      value={stringValues[field.name]}
                      onChange={handleStringChange(field.name)}
                      onClear={() => updateStringValue(field.name, "")}
                    />
                  );
                case FormFieldType.NUMERIC:
                  return (
                    <FormFieldNumericInput
                      key={field.name}
                      {...field}
                      value={numericValues[field.name]}
                      onChange={value => updateNumericValue(field.name, value)}
                    />
                  );
                case FormFieldType.OPTIONS:
                  return (
                    <FormOptionsField
                      key={field.name}
                      {...field}
                      currentSelection={selectionValues[field.name]}
                      selectionChangeEmitter={selectionChangeReceiver(
                        field.name,
                      )}
                      onAdditionalStringFieldChange={(
                        item,
                        additionalFieldName,
                        value,
                      ) =>
                        handleAdditionalStringFieldChange(
                          field.name,
                          item,
                          additionalFieldName,
                        )(value)
                      }
                      onAdditionalBooleanFieldChange={(
                        item,
                        additionalFieldName,
                        event,
                      ) =>
                        handleAdditionalBooleanFieldChange(
                          field.name,
                          item,
                          additionalFieldName,
                        )(event)
                      }
                      params={{
                        ...field.params,
                        options: field.params.options.map(option => ({
                          ...option,
                          chosen: selectionValues[field.name].some(
                            sv =>
                              sv.type === field.params.dataType &&
                              sv.value === option.value,
                          ),
                        })),
                      }}
                    />
                  );
                case FormFieldType.SEARCH:
                  return (
                    <FormSearchField
                      key={field.name}
                      {...field}
                      selectionChangeEmitter={selectionChangeReceiver(
                        field.name,
                      )}
                      currentSelection={selectionValues[field.name]}
                      onAdditionalStringFieldChange={(
                        item,
                        additionalFieldName,
                        value,
                      ) =>
                        handleAdditionalStringFieldChange(
                          field.name,
                          item,
                          additionalFieldName,
                        )(value)
                      }
                      onAdditionalBooleanFieldChange={(
                        item,
                        additionalFieldName,
                        event,
                      ) =>
                        handleAdditionalBooleanFieldChange(
                          field.name,
                          item,
                          additionalFieldName,
                        )(event)
                      }
                      params={{
                        ...field.params,
                        currentSelection: selectionValues[field.name],
                      }}
                    />
                  );
                case FormFieldType.CHECKBOX:
                  return (
                    <FormCheckboxField
                      key={field.name}
                      {...field}
                      checked={booleanValues[field.name]}
                      onChange={handleBooleanChange(field.name)}
                    />
                  );
              }
            })}
            <MainActions
              confirmEnabled={isConfirmEnabled()}
              confirmCallback={() => {
                void dispatchResults({
                  stringValues,
                  numericValues,
                  booleanValues,
                  selectionValues,
                });
              }}
              frameId={frameId}
            />
          </Stack>
        </Paper>
      </section>
    </div>
  );
};
