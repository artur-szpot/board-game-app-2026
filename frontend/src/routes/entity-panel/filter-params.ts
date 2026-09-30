import type { EntityPanelFilterDefinition } from "./entity-panel-types";
import { EntityPanelFilterKind } from "./entity-panel-types";

export const FILTER_PARAM_PREFIX = "f_";

/** API-ready filter values: every entry is already a string the backend understands. */
export type EntityPanelFilterValues = Record<string, string>;

export const parseIdList = (value: string): string[] => [
  ...new Set(
    value
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0),
  ),
];

const normalizeFilterValue = (
  definition: EntityPanelFilterDefinition,
  value: string,
): string | undefined => {
  switch (definition.kind) {
    case EntityPanelFilterKind.NUMBER: {
      if (!/^\d+$/.test(value) || Number(value) < 1) {
        return undefined;
      }
      return String(Number(value));
    }
    case EntityPanelFilterKind.SELECT:
      return definition.options.some(option => option.value === value)
        ? value
        : undefined;
    case EntityPanelFilterKind.TRI_STATE:
      return value === "true" || value === "false" ? value : undefined;
    case EntityPanelFilterKind.ENTITY_SELECTION: {
      const ids = parseIdList(value);
      return ids.length > 0 ? ids.join(",") : undefined;
    }
  }
};

export const filterParamName = (key: string): string =>
  `${FILTER_PARAM_PREFIX}${key}`;

export const parseFilterParams = (
  searchParams: URLSearchParams,
  definitions: EntityPanelFilterDefinition[] = [],
): EntityPanelFilterValues => {
  const values: EntityPanelFilterValues = {};

  definitions.forEach(definition => {
    const raw = searchParams.get(filterParamName(definition.key));
    if (raw === null) {
      return;
    }

    const normalized = normalizeFilterValue(definition, raw);
    if (normalized !== undefined) {
      values[definition.key] = normalized;
    }
  });

  return values;
};

/** Empty or invalid values in the patch remove the corresponding parameter. */
export const buildFilterSearch = (
  searchParams: URLSearchParams,
  patch: EntityPanelFilterValues,
  definitions: EntityPanelFilterDefinition[] = [],
): URLSearchParams => {
  const next = new URLSearchParams(searchParams);

  Object.entries(patch).forEach(([key, value]) => {
    const definition = definitions.find(candidate => candidate.key === key);
    if (!definition) {
      return;
    }

    const normalized = normalizeFilterValue(definition, value);
    if (normalized === undefined) {
      next.delete(filterParamName(key));
      return;
    }

    next.set(filterParamName(key), normalized);
  });

  return next;
};

export const clearFilterSearch = (
  searchParams: URLSearchParams,
): URLSearchParams => {
  const next = new URLSearchParams(searchParams);

  [...next.keys()]
    .filter(key => key.startsWith(FILTER_PARAM_PREFIX))
    .forEach(key => next.delete(key));

  return next;
};
