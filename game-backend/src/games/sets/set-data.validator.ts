export const SET_IDENTIFIER = /^[a-z][a-zA-Z0-9]*$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const validateSetData = (data: unknown): string[] => {
  if (!isObject(data)) {
    return ['data must be an object'];
  }
  const errors: string[] = [];
  const { properties, items } = data;
  if (!Array.isArray(properties) || properties.length === 0) {
    errors.push('data.properties must be a non-empty array');
  } else {
    properties.forEach((property, index) => {
      if (typeof property !== 'string' || !SET_IDENTIFIER.test(property)) {
        errors.push(`data.properties[${index}] must be camelCase`);
      }
    });
    if (new Set(properties).size !== properties.length) {
      errors.push('data.properties must be unique');
    }
  }
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('data.items must be a non-empty array');
    return errors;
  }
  const names = new Set<string>();
  items.forEach((item, index) => {
    const path = `data.items[${index}]`;
    if (!isObject(item)) {
      errors.push(`${path} must be an object`);
      return;
    }
    if (typeof item.name !== 'string' || !SET_IDENTIFIER.test(item.name)) {
      errors.push(`${path}.name must be camelCase`);
    } else if (names.has(item.name)) {
      errors.push(`${path}.name "${item.name}" is not unique`);
    } else {
      names.add(item.name);
    }
    if (!isObject(item.properties)) {
      errors.push(`${path}.properties must be an object`);
      return;
    }
    const values = item.properties;
    if (
      Array.isArray(properties) &&
      (Object.keys(values).length !== properties.length ||
        !properties.every(
          (property) =>
            typeof property === 'string' &&
            Object.prototype.hasOwnProperty.call(values, property),
        ))
    ) {
      errors.push(`${path}.properties must have exactly the declared keys`);
    }
    if (!Object.values(values).every((value) => typeof value === 'string')) {
      errors.push(`${path}.properties values must be strings`);
    }
  });
  return errors;
};
