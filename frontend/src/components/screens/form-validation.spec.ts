import { describe, expect, it } from "vitest";

import { formCheckbox } from "../forms/FormCheckboxField";
import { formNumber } from "../forms/FormFieldNumericInput";
import { formSearch } from "../forms/FormSearchField";
import { formText } from "../forms/FormTextField";
import type { FieldValidator } from "../forms/validators";
import {
    isGreaterThan,
    isGreaterThanOrEqual,
    isLesserThan,
    isLesserThanOrEqual,
} from "../forms/validators";
import {
    countErrors,
    describeSelectionStrategy,
    validateField,
    validateForm,
} from "./form-validation";
import type { FormScreenField, FormScreenValues } from "./FormScreenProps";
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
  // Most cases involve a single field, so default the form to just that field.
  const validate = (
    field: FormScreenField,
    values: FormScreenValues,
    fields: FormScreenField[] = [field],
  ) => validateField(field, values, fields);

  it("never reports checkbox fields", () => {
    const field = formCheckbox({
      name: "isPublic",
      label: "Public",
      checked: false,
    });
    expect(validate(field, emptyValues)).toEqual([]);
  });

  it("reports a missing required text value", () => {
    const field = formText({ name: "name", label: "Name", required: true });
    expect(validate(field, valuesWith({ stringValues: { name: "" } }))).toEqual(
      ["Name is required"],
    );
  });

  it("accepts a filled required text value", () => {
    const field = formText({ name: "name", label: "Name", required: true });
    expect(
      validate(field, valuesWith({ stringValues: { name: "Chess" } })),
    ).toEqual([]);
  });

  it("ignores an empty optional text value", () => {
    const field = formText({ name: "description", label: "Description" });
    expect(
      validate(field, valuesWith({ stringValues: { description: "" } })),
    ).toEqual([]);
  });

  it("reports a missing required numeric value", () => {
    const field = formNumber({
      name: "minPlayers",
      label: "Minimum players",
      required: true,
    });
    expect(
      validate(field, valuesWith({ numericValues: { minPlayers: null } })),
    ).toEqual(["Minimum players is required"]);
  });

  it("accepts zero as a required numeric value", () => {
    const field = formNumber({
      name: "minPlayers",
      label: "Minimum players",
      required: true,
    });
    expect(
      validate(field, valuesWith({ numericValues: { minPlayers: 0 } })),
    ).toEqual([]);
  });

  it("reports a selection breaking its strategy", () => {
    const field = searchField(selectionStrategySelectNumber({ min: 2 }));
    expect(
      validate(
        field,
        valuesWith({ selectionValues: { tags: selectionOf(1) } }),
      ),
    ).toEqual(["Tags: select at least 2"]);
  });

  it("accepts a selection satisfying its strategy", () => {
    const field = searchField(selectionStrategySelectNumber({ min: 2 }));
    expect(
      validate(
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
      validate(
        field,
        valuesWith({ selectionValues: { tags: selectionOf(1) } }),
      ),
    ).toEqual(["Tags: select exactly 2"]);
  });

  it("treats a missing selection entry as empty", () => {
    const field = searchField(selectionStrategyChooseOne());
    expect(validate(field, emptyValues)).toEqual([
      "Tags: choose exactly one option",
    ]);
  });
});

describe("comparison validators", () => {
  const minPlayers = formNumber({
    name: "minPlayers",
    label: "Minimum players",
  });

  const maxPlayersWith = (validator: FieldValidator) =>
    formNumber({
      name: "maxPlayers",
      label: "Maximum players",
      validators: [validator],
    });

  const validateMaxPlayers = (
    validator: FieldValidator,
    min: number | null,
    max: number | null,
  ) => {
    const field = maxPlayersWith(validator);
    return validateField(
      field,
      valuesWith({
        numericValues: { minPlayers: min, maxPlayers: max },
      }),
      [minPlayers, field],
    );
  };

  it.each([
    [isGreaterThan, 2, 4, []],
    [
      isGreaterThan,
      4,
      2,
      ["Maximum players must be greater than Minimum players"],
    ],
    [
      isGreaterThan,
      3,
      3,
      ["Maximum players must be greater than Minimum players"],
    ],
    [isGreaterThanOrEqual, 3, 3, []],
    [
      isGreaterThanOrEqual,
      4,
      2,
      ["Maximum players must be greater than or equal to Minimum players"],
    ],
    [isLesserThan, 4, 2, []],
    [
      isLesserThan,
      3,
      3,
      ["Maximum players must be lesser than Minimum players"],
    ],
    [isLesserThanOrEqual, 3, 3, []],
    [
      isLesserThanOrEqual,
      2,
      4,
      ["Maximum players must be lesser than or equal to Minimum players"],
    ],
  ])("compares against the referenced field", (builder, min, max, expected) => {
    expect(validateMaxPlayers(builder("minPlayers"), min, max)).toEqual(
      expected,
    );
  });

  it("passes when the declaring field has no value", () => {
    expect(validateMaxPlayers(isGreaterThan("minPlayers"), 4, null)).toEqual(
      [],
    );
  });

  it("passes when the referenced field has no value", () => {
    expect(validateMaxPlayers(isGreaterThan("minPlayers"), null, 4)).toEqual(
      [],
    );
  });

  it("reports the required error and the comparison error together", () => {
    const field = formNumber({
      name: "maxPlayers",
      label: "Maximum players",
      required: true,
      validators: [isGreaterThan("minPlayers")],
    });
    expect(
      validateField(
        field,
        valuesWith({ numericValues: { minPlayers: 4, maxPlayers: null } }),
        [minPlayers, field],
      ),
      // A missing value skips the comparison, so only the required error remains.
    ).toEqual(["Maximum players is required"]);
  });

  it("throws when the referenced field does not exist", () => {
    const field = maxPlayersWith(isGreaterThan("nonexistent"));
    expect(() =>
      validateField(field, valuesWith({ numericValues: { maxPlayers: 4 } }), [
        field,
      ]),
    ).toThrow("Unknown field referenced by validator: nonexistent");
  });

  it("throws when the declaring field is not numeric", () => {
    const field = formText({
      name: "name",
      label: "Name",
      validators: [isGreaterThan("minPlayers")],
    });
    expect(() =>
      validateField(field, emptyValues, [minPlayers, field]),
    ).toThrow("Comparison validators require numeric fields: name");
  });

  it("throws when the referenced field is not numeric", () => {
    const other = formText({ name: "name", label: "Name" });
    const field = maxPlayersWith(isGreaterThan("name"));
    expect(() => validateField(field, emptyValues, [other, field])).toThrow(
      "Comparison validators require numeric fields: name",
    );
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
