import type {
    ScoringCategory,
    ScoringGroup,
    ScoringRow,
    ScoringSchemaDefinition,
} from "../../dto/scoring-schema.dto";
import {
    SCORING_SCHEMA_VERSION,
    ScoringGroupMechanism,
} from "../../dto/scoring-schema.dto";

const newId = () => crypto.randomUUID();

export const emptyRow = (): ScoringRow => ({ id: newId(), name: "" });

export const emptyCategory = (): ScoringCategory => ({
  id: newId(),
  name: "",
  rows: [emptyRow()],
});

export const emptyGroup = (): ScoringGroup => ({
  id: newId(),
  name: "",
  mechanism: ScoringGroupMechanism.SUM_ALL,
  categories: [emptyCategory()],
});

export const emptySchema = (): ScoringSchemaDefinition => ({
  version: SCORING_SCHEMA_VERSION,
  groups: [emptyGroup()],
});

export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const trimmed = (value?: string) => value?.trim() ?? "";

/** Drops blank optional names so they are never persisted as empty strings. */
export const normalizeSchema = (
  schema: ScoringSchemaDefinition,
): ScoringSchemaDefinition => ({
  version: SCORING_SCHEMA_VERSION,
  groups: schema.groups.map(group => ({
    id: group.id,
    mechanism: group.mechanism,
    ...(trimmed(group.name) && { name: trimmed(group.name) }),
    categories: group.categories.map(category => ({
      id: category.id,
      ...(trimmed(category.name) && { name: trimmed(category.name) }),
      rows: category.rows.map(row => ({
        id: row.id,
        ...(trimmed(row.name) && { name: trimmed(row.name) }),
        ...(row.icon && { icon: row.icon }),
      })),
    })),
  })),
});

export const isRowLabelled = (row: ScoringRow): boolean =>
  Boolean(trimmed(row.name) || row.icon);

export const validateSchemaDraft = (
  name: string,
  schema: ScoringSchemaDefinition,
): string[] => {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("Schema name is required");
  }
  if (schema.groups.length === 0) {
    errors.push("At least one group is required");
  }
  if (schema.groups.some(group => group.categories.length === 0)) {
    errors.push("Every group needs at least one category");
  }
  if (
    schema.groups.some(group =>
      group.categories.some(category => category.rows.length === 0),
    )
  ) {
    errors.push("Every category needs at least one row");
  }
  if (
    schema.groups.some(group =>
      group.categories.some(category =>
        category.rows.some(row => !isRowLabelled(row)),
      ),
    )
  ) {
    errors.push("Every row needs a name or an icon");
  }

  return errors;
};
