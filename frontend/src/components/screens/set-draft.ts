import type { SetDataDto } from "../../dto/helper-logic.dto";
import { SET_IDENTIFIER } from "../../utils/set-data";

export type PropertyDraft = { id: string; name: string };
export type ItemDraft = {
  id: string;
  name: string;
  values: Record<string, string>;
};
export type SetDraft = { properties: PropertyDraft[]; items: ItemDraft[] };

const emptyProperty = (): PropertyDraft => ({
  id: crypto.randomUUID(),
  name: "",
});
export const emptySetItem = (): ItemDraft => ({
  id: crypto.randomUUID(),
  name: "",
  values: {},
});

export const createSetDraft = (data?: SetDataDto): SetDraft => {
  const properties =
    data?.properties.map(name => ({ id: crypto.randomUUID(), name })) ?? [];
  return {
    properties: [...properties, emptyProperty()],
    items: data?.items.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      values: Object.fromEntries(
        properties.map(property => [
          property.id,
          item.properties[property.name],
        ]),
      ),
    })) ?? [emptySetItem()],
  };
};

export const enteredProperties = (draft: SetDraft) =>
  draft.properties.filter(
    (property, index) =>
      property.name !== "" || index !== draft.properties.length - 1,
  );

export const updateProperty = (
  draft: SetDraft,
  id: string,
  name: string,
): SetDraft => {
  const properties = draft.properties.map(property =>
    property.id === id ? { ...property, name } : property,
  );
  if (properties.at(-1)?.name !== "") {
    properties.push(emptyProperty());
  }
  return { ...draft, properties };
};

export const removeProperty = (draft: SetDraft, id: string): SetDraft => {
  let properties = draft.properties.filter(property => property.id !== id);
  if (properties.length === 0) {
    properties = [emptyProperty()];
  } else if (properties.at(-1)?.name !== "") {
    properties.push(emptyProperty());
  }
  return {
    properties,
    items: draft.items.map(item => ({
      ...item,
      values: Object.fromEntries(
        Object.entries(item.values).filter(([key]) => key !== id),
      ),
    })),
  };
};

export const identifierError = (
  name: string,
  names?: string[],
): string | undefined => {
  if (!SET_IDENTIFIER.test(name)) {
    return "A camelCase name is required";
  }
  if (names && names.filter(value => value === name).length > 1) {
    return "Names must be unique";
  }
  return undefined;
};

export const validateSetDraft = (name: string, draft: SetDraft): string[] => {
  const errors: string[] = [];
  if (identifierError(name)) {
    errors.push("Data set name must be camelCase");
  }
  const properties = enteredProperties(draft);
  if (properties.length === 0) {
    errors.push("At least one property must be set");
  }
  if (
    properties.some(property =>
      identifierError(
        property.name,
        properties.map(row => row.name),
      ),
    )
  ) {
    errors.push("Property names must be unique and camelCase");
  }
  if (draft.items.length === 0) {
    errors.push("At least one item must be set");
  }
  if (
    draft.items.some(item =>
      identifierError(
        item.name,
        draft.items.map(row => row.name),
      ),
    )
  ) {
    errors.push("Item names must be unique and camelCase");
  }
  return errors;
};

export const serializeSetDraft = (draft: SetDraft): SetDataDto => {
  const properties = enteredProperties(draft);
  return {
    properties: properties.map(property => property.name),
    items: draft.items.map(item => ({
      name: item.name,
      properties: Object.fromEntries(
        properties.map(property => [
          property.name,
          item.values[property.id] ?? "",
        ]),
      ),
    })),
  };
};
