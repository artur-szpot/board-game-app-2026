import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { getFormScreenAsyncValidators } from "../../store/features/formScreenAsyncValidatorRegistry";
import type {
    AsyncValidatorResponse,
    FormAsyncValidator,
} from "./form-async-validators";
import type { FormErrors } from "./form-validation";
import type { FormScreenValues } from "./FormScreenProps";

export const STABILITY_IN_MS = 500;

const lookupValue = (name: string, values: FormScreenValues): unknown => {
  if (name in values.stringValues) {
    return values.stringValues[name];
  }
  if (name in values.numericValues) {
    return values.numericValues[name];
  }
  if (name in values.booleanValues) {
    return values.booleanValues[name];
  }
  return values.selectionValues[name];
};

const isEmptyValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const watchedSignature = (
  validators: FormAsyncValidator[],
  values: FormScreenValues,
) =>
  JSON.stringify(
    validators.map(validator =>
      validator.watchedFields.map(field => lookupValue(field, values)),
    ),
  );

export type AsyncValidationState = {
  asyncErrors: FormErrors;
  pendingFields: Set<string>;
};

export const useFormAsyncValidators = (
  frameId: string,
  values: FormScreenValues,
  accessToken: string | null | undefined,
  onFailure: () => void,
): AsyncValidationState => {
  const validators = getFormScreenAsyncValidators(frameId);
  const [asyncErrors, setAsyncErrors] = useState<FormErrors>({});
  const [pendingFields, setPendingFields] = useState<Set<string>>(new Set());

  const signature = watchedSignature(validators, values);
  // Read inside the effect so changing values alone cannot retrigger it.
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onFailureRef = useRef(onFailure);
  onFailureRef.current = onFailure;

  useEffect(() => {
    const activeValidators = validators.filter(
      validator =>
        !isEmptyValue(lookupValue(validator.targetField, valuesRef.current)),
    );

    setAsyncErrors({});
    setPendingFields(new Set(activeValidators.map(v => v.targetField)));

    if (activeValidators.length === 0) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      void Promise.all(
        activeValidators.map(async validator => {
          try {
            const response = await axios.post<AsyncValidatorResponse>(
              `${import.meta.env.VITE_API_URL as string}/${validator.url}`,
              validator.buildBody(valuesRef.current),
              {
                signal: controller.signal,
                headers: accessToken
                  ? { Authorization: `Bearer ${accessToken}` }
                  : undefined,
              },
            );
            return response.data.checkPassed ? null : validator;
          } catch (error) {
            // A flaky network must not block the form, so treat it as a pass.
            if (!axios.isCancel(error)) {
              console.error("Async form validation failed", error);
            }
            return null;
          }
        }),
      ).then(results => {
        if (controller.signal.aborted) {
          return;
        }
        const failed = results.filter(
          (validator): validator is FormAsyncValidator => validator !== null,
        );
        setPendingFields(new Set());
        if (failed.length === 0) {
          return;
        }
        setAsyncErrors(
          failed.reduce<FormErrors>(
            (errors, validator) => ({
              ...errors,
              [validator.targetField]: [
                ...(errors[validator.targetField] ?? []),
                validator.errorMessage,
              ],
            }),
            {},
          ),
        );
        onFailureRef.current();
      });
    }, STABILITY_IN_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, accessToken, frameId]);

  return { asyncErrors, pendingFields };
};
