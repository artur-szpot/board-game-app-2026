import type { FormAsyncValidator } from "../../components/screens/form-async-validators";

const formScreenAsyncValidatorRegistry = new Map<
  string,
  FormAsyncValidator[]
>();

export const registerFormScreenAsyncValidators = (
  frameId: string,
  validators: FormAsyncValidator[] | undefined,
): void => {
  if (validators?.length) {
    formScreenAsyncValidatorRegistry.set(frameId, validators);
  }
};

export const getFormScreenAsyncValidators = (
  frameId: string,
): FormAsyncValidator[] => formScreenAsyncValidatorRegistry.get(frameId) ?? [];

export const clearFormScreenAsyncValidators = (frameId: string): void => {
  formScreenAsyncValidatorRegistry.delete(frameId);
};
