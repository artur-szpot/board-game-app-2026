import type { SetDataDto } from "../dto/helper-logic.dto";

export const SET_IDENTIFIER = /^[a-z][a-zA-Z0-9]*$/;
export const SET_NAMING_HELP =
  "Use camelCase: start with a lowercase letter, then letters or digits only.";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isSetData = (value: unknown): value is SetDataDto => {
  if (!isObject(value)) {
    return false;
  }
  const { properties, items } = value;
  if (
    !Array.isArray(properties) ||
    properties.length === 0 ||
    !properties.every(
      (property: unknown): property is string =>
        typeof property === "string" && SET_IDENTIFIER.test(property),
    ) ||
    new Set(properties).size !== properties.length ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return false;
  }
  const names = new Set<string>();
  return items.every(item => {
    if (
      !isObject(item) ||
      typeof item.name !== "string" ||
      !SET_IDENTIFIER.test(item.name) ||
      names.has(item.name) ||
      !isObject(item.properties)
    ) {
      return false;
    }
    names.add(item.name);
    const values = item.properties;
    return (
      Object.keys(values).length === properties.length &&
      properties.every(
        property =>
          Object.prototype.hasOwnProperty.call(values, property) &&
          typeof values[property] === "string",
      )
    );
  });
};

export const setItemTranslationKey = (setName: string, itemName: string) =>
  `helper.set.${setName}.${itemName}`;
