import { isLabelTuple } from '../helpers/logic/helper-logic.validator';

export const validateSetData = (data: unknown): string[] => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['data must be an object'];
  }
  const { items } = data as { items?: unknown };
  if (!Array.isArray(items) || items.length === 0) {
    return ['data.items must be a non-empty array'];
  }
  const errors: string[] = [];
  const values = new Set<number>();
  items.forEach((item, index) => {
    const path = `data.items[${index}]`;
    if (typeof item !== 'object' || item === null) {
      errors.push(`${path} must be an object`);
      return;
    }
    const { value, label } = item as { value?: unknown; label?: unknown };
    if (!Number.isInteger(value)) {
      errors.push(`${path}.value must be an integer`);
    } else if (values.has(value as number)) {
      errors.push(`${path}.value ${value} is not unique`);
    } else {
      values.add(value as number);
    }
    if (!isLabelTuple(label)) {
      errors.push(`${path}.label must be a label tuple`);
    }
  });
  return errors;
};
