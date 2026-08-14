import { describe, expect, it } from "vitest";

import { formCheckbox } from "../forms/FormCheckboxField";
import { formNumber } from "../forms/FormFieldNumericInput";
import { formSearch } from "../forms/FormSearchField";
import { formText } from "../forms/FormTextField";
import {
    countErrors,
    describeSelectionStrategy,
    validateField,
    validateForm,
} from "./form-validation";
import type { FormScreenValues } from "./FormScreenProps";
import type { SelectionStrategy } from "./selection-strategies";
import {
    GameDataType,
    ResultMappingStrategy,
    selectionStrategyChooseOne,
    selectionStrategySelectAnyNumber,
    selectionStrategySelectNumber,
} from "./selection-strategies";

const emptyValues: FormScreenValues = {
  stringValues: {},
  numericValues: {},
  booleanValues: {},
  selectionValues: {},
};

const valuesWith = (
  overrides: Partial<FormScreenValues>,
): FormScreenValues => ({
  ...emptyValues,
  ...overrides,
});

const searchField = (strategy: SelectionStrategy) =>
  formSearch({
    name: "tags",
    label: "Tags",
    resultMapping: ResultMappingStrategy.VALUES_ONLY,
    params: {
      title: "Tags",
      strategy,
      dataTypes: [GameDataType.TAG],
    },
  });

const selectionOf = (count: number) =>
  Array.from({ length: count }, (_unused, index) => ({
    type: GameDataType.TAG,
    value: `tag-${index.toString()}`,
    name: `Tag ${index.toString()}`,
  }));

describe("describeSelectionStrategy", () => {
  it("describes choose one", () => {
    expect(describeSelectionStrategy(selectionStrategyChooseOne())).toBe(
      "choose exactly one option",
    );
  });

  it("describes exact", () => {
    expect(
      describeSelectionStrategy(selectionStrategySelectNumber({ exact: 3 })),
    ).toBe("select exactly 3");
  });

  it("describes min only", () => {
    expect(
      describeSelectionStrategy(selectionStrategySelectNumber({ min: 2 })),
    ).toBe("select at least 2");
  });

  it("describes max only", () => {
    expect(
      describeSelectionStrategy(selectionStrategySelectNumber({ max: 4 })),
    ).toBe("select at most 4");
  });

  it("describes min and max", () => {
    expect(
      describeSelectionStrategy(
        selectionStrategySelectNumber({ min: 1, max: 4 }),
      ),
    ).toBe("select at least 1 and at most 4");
  });

  it("falls back when unconstrained", () => {
    expect(describeSelectionStrategy(selectionStrategySelectAnyNumber())).toBe(
      "selection is invalid",
    );
  });
});

describe("validateField", () => {
  it("never reports checkbox fields", () => {
    const field = formCheckbox({
      name: "isPublic",
      label: "Public",
      checked: false,
    });
    expect(validateField(field, emptyValues)).toEqual([]);
  });

  it("reports a missing required text value", () => {
    const field = formText({ name: "name", label: "Name", required: true });
    expect(
      validateField(field, valuesWith({ stringValues: { name: "" } })),
    ).toEqual(["Name is required"]);
  });

  it("accepts a filled required text value", () => {
    const field = formText({ name: "name", label: "Name", required: true });
    expect(
      validateField(field, valuesWith({ stringValues: { name: "Chess" } })),
    ).toEqual([]);
  });

  it("ignores an empty optional text value", () => {
    const field = formText({ name: "description", label: "Description" });
    expect(
      validateField(field, valuesWith({ stringValues: { description: "" } })),
    ).toEqual([]);
  });

  it("reports a missing required numeric value", () => {
    const field = formNumber({
      name: "minPlayers",
      label: "Minimum players",
      required: true,
    });
    expect(
      validateField(field, valuesWith({ numericValues: { minPlayers: null } })),
    ).toEqual(["Minimum players is required"]);
  });

  it("accepts zero as a required numeric value", () => {
    const field = formNumber({
      name: "minPlayers",
      label: "Minimum players",
      required: true,
    });
    expect(
      validateField(field, valuesWith({ numericValues: { minPlayers: 0 } })),
    ).toEqual([]);
  });

  it("reports a selection breaking its strategy", () => {
    const field = searchField(selectionStrategySelectNumber({ min: 2 }));
    expect(
      validateField(
        field,
        valuesWith({ selectionValues: { tags: selectionOf(1) } }),
      ),
    ).toEqual(["Tags: select at least 2"]);
  });

  it("accepts a selection satisfying its strategy", () => {
    const field = searchField(selectionStrategySelectNumber({ min: 2 }));
    expect(
      validateField(
        field,
        valuesWith({ selectionValues: { tags: selectionOf(2) } }),
      ),
    ).toEqual([]);
  });

  it("prefers the correctness strategy over the selection strategy", () => {
    const field = formSearch({
      name: "tags",
      label: "Tags",
      resultMapping: ResultMappingStrategy.VALUES_ONLY,
      params: {
        title: "Tags",
        strategy: selectionStrategySelectAnyNumber(),
        correctnessStrategy: selectionStrategySelectNumber({ exact: 2 }),
        dataTypes: [GameDataType.TAG],
      },
    });
    expect(
      validateField(
        field,
        valuesWith({ selectionValues: { tags: selectionOf(1) } }),
      ),
    ).toEqual(["Tags: select exactly 2"]);
  });

  it("treats a missing selection entry as empty", () => {
    const field = searchField(selectionStrategyChooseOne());
    expect(validateField(field, emptyValues)).toEqual([
      "Tags: choose exactly one option",
    ]);
  });
});

describe("validateForm", () => {
  it("omits valid fields", () => {
    const fields = [
      formText({ name: "name", label: "Name", required: true }),
      formText({ name: "description", label: "Description" }),
    ];
    expect(
      validateForm(
        fields,
        valuesWith({ stringValues: { name: "Chess", description: "" } }),
      ),
    ).toEqual({});
  });

  it("collects errors keyed by field name", () => {
    const fields = [
      formText({ name: "name", label: "Name", required: true }),
      searchField(selectionStrategyChooseOne()),
    ];
    expect(
      validateForm(fields, valuesWith({ stringValues: { name: "" } })),
    ).toEqual({
      name: ["Name is required"],
      tags: ["Tags: choose exactly one option"],
    });
  });
});

describe("countErrors", () => {
  it("counts an empty map as zero", () => {
    expect(countErrors({})).toBe(0);
  });

  it("sums messages across fields", () => {
    expect(countErrors({ name: ["a"], tags: ["b", "c"] })).toBe(3);
  });
});
