import type {
    FormFieldCustomMappings,
    FormScreenField,
} from "../../components/screens/FormScreenProps";
import {
    getCustomMappingFromField,
    withCustomMappingRemoved,
} from "../../components/screens/FormScreenProps";

const formScreenCustomMappingRegistry = new Map<
  string,
  FormFieldCustomMappings
>();

export const registerFormScreenCustomMappings = (
  frameId: string,
  fields: FormScreenField[],
): FormScreenField[] => {
  const customMappings = Object.fromEntries(
    fields
      .map(field => [field.name, getCustomMappingFromField(field)] as const)
      .filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          entry[1] !== undefined,
      ),
  );

  if (Object.keys(customMappings).length > 0) {
    formScreenCustomMappingRegistry.set(frameId, customMappings);
  }

  return fields.map(withCustomMappingRemoved);
};

export const getFormScreenCustomMappings = (
  frameId: string,
): FormFieldCustomMappings | undefined => {
  return formScreenCustomMappingRegistry.get(frameId);
};

export const clearFormScreenCustomMappings = (frameId: string): void => {
  formScreenCustomMappingRegistry.delete(frameId);
};
