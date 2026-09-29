import { describe, expect, it } from "vitest";

import type {
    ScoreValues,
    ScoringGroup,
    ScoringSchemaDefinition,
} from "../dto/scoring-schema.dto";
import {
    SCORING_SCHEMA_VERSION,
    ScoringGroupMechanism,
} from "../dto/scoring-schema.dto";
import {
    categorySubtotal,
    grandTotal,
    groupTotal,
    rowScore,
} from "./score-calculation";

const group = (
  mechanism: ScoringGroupMechanism,
  subtotals: number[],
): ScoringGroup => ({
  id: "group",
  mechanism,
  categories: subtotals.map((_, index) => ({
    id: `category-${index.toString()}`,
    rows: [{ id: `row-${index.toString()}`, name: `Row ${index.toString()}` }],
  })),
});

const valuesFor = (subtotals: number[]): ScoreValues =>
  Object.fromEntries(
    subtotals.map((value, index) => [`row-${index.toString()}`, { D: value }]),
  );

describe("score-calculation", () => {
  it("treats missing entries as zero", () => {
    expect(rowScore({}, "row-0", "D")).toBe(0);
    expect(rowScore({ "row-0": {} }, "row-0", "D")).toBe(0);
  });

  it("sums all rows within a category", () => {
    const values: ScoreValues = {
      a: { D: 3, B: 1 },
      b: { D: 4 },
    };

    expect(
      categorySubtotal(
        {
          id: "c",
          rows: [
            { id: "a", name: "A" },
            { id: "b", name: "B" },
          ],
        },
        values,
        "D",
      ),
    ).toBe(7);
    expect(
      categorySubtotal(
        {
          id: "c",
          rows: [
            { id: "a", name: "A" },
            { id: "b", name: "B" },
          ],
        },
        values,
        "B",
      ),
    ).toBe(1);
  });

  describe("group mechanisms", () => {
    const subtotals = [2, 7, 5];

    it.each([
      [ScoringGroupMechanism.SUM_ALL, 14],
      [ScoringGroupMechanism.SUM_ALL_PLUS_SMALLEST, 16],
      [ScoringGroupMechanism.GREATEST_ONLY, 7],
      [ScoringGroupMechanism.SMALLEST_ONLY, 2],
    ])("applies %s", (mechanism, expected) => {
      expect(
        groupTotal(group(mechanism, subtotals), valuesFor(subtotals), "D"),
      ).toBe(expected);
    });

    it("handles ties without double counting", () => {
      const tied = [4, 4];
      expect(
        groupTotal(
          group(ScoringGroupMechanism.GREATEST_ONLY, tied),
          valuesFor(tied),
          "D",
        ),
      ).toBe(4);
      expect(
        groupTotal(
          group(ScoringGroupMechanism.SUM_ALL_PLUS_SMALLEST, tied),
          valuesFor(tied),
          "D",
        ),
      ).toBe(12);
    });

    it("returns zero for a group without categories", () => {
      expect(
        groupTotal(
          {
            id: "g",
            mechanism: ScoringGroupMechanism.GREATEST_ONLY,
            categories: [],
          },
          {},
          "D",
        ),
      ).toBe(0);
    });

    it("supports negative subtotals", () => {
      const negatives = [-3, 5];
      expect(
        groupTotal(
          group(ScoringGroupMechanism.SUM_ALL_PLUS_SMALLEST, negatives),
          valuesFor(negatives),
          "D",
        ),
      ).toBe(-1);
    });
  });

  it("adds every group total into the grand total", () => {
    const schema: ScoringSchemaDefinition = {
      version: SCORING_SCHEMA_VERSION,
      groups: [
        {
          id: "g1",
          mechanism: ScoringGroupMechanism.SUM_ALL,
          categories: [{ id: "c1", rows: [{ id: "r1", name: "R1" }] }],
        },
        {
          id: "g2",
          mechanism: ScoringGroupMechanism.GREATEST_ONLY,
          categories: [
            { id: "c2", rows: [{ id: "r2", name: "R2" }] },
            { id: "c3", rows: [{ id: "r3", name: "R3" }] },
          ],
        },
      ],
    };
    const values: ScoreValues = {
      r1: { D: 5 },
      r2: { D: 2 },
      r3: { D: 9 },
    };

    expect(grandTotal(schema, values, "D")).toBe(14);
    expect(grandTotal(schema, values, "B")).toBe(0);
  });
});
