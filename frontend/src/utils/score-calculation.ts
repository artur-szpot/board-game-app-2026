import type {
    ScoreValues,
    ScoringCategory,
    ScoringGroup,
    ScoringSchemaDefinition,
} from "../dto/scoring-schema.dto";
import { ScoringGroupMechanism } from "../dto/scoring-schema.dto";

export const rowScore = (
  values: ScoreValues,
  rowId: string,
  player: string,
): number => values[rowId]?.[player] ?? 0;

export const categorySubtotal = (
  category: ScoringCategory,
  values: ScoreValues,
  player: string,
): number =>
  category.rows.reduce(
    (total, row) => total + rowScore(values, row.id, player),
    0,
  );

export const groupTotal = (
  group: ScoringGroup,
  values: ScoreValues,
  player: string,
): number => {
  const subtotals = group.categories.map(category =>
    categorySubtotal(category, values, player),
  );

  if (subtotals.length === 0) {
    return 0;
  }

  const sum = subtotals.reduce((total, subtotal) => total + subtotal, 0);

  switch (group.mechanism) {
    case ScoringGroupMechanism.SUM_ALL:
      return sum;
    case ScoringGroupMechanism.SUM_ALL_PLUS_SMALLEST:
      return sum + Math.min(...subtotals);
    case ScoringGroupMechanism.GREATEST_ONLY:
      return Math.max(...subtotals);
    case ScoringGroupMechanism.SMALLEST_ONLY:
      return Math.min(...subtotals);
  }
};

export const grandTotal = (
  schema: ScoringSchemaDefinition,
  values: ScoreValues,
  player: string,
): number =>
  schema.groups.reduce(
    (total, group) => total + groupTotal(group, values, player),
    0,
  );
