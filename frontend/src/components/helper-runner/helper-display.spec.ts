import { describe, expect, it } from "vitest";
import { formatVariable } from "./helper-display";
import { buildTranslate } from "./helper-i18n";
import { buildTestHelperLogic, TEST_SETS } from "./test-helper-logic";

describe("set item display", () => {
  const context = {
    logic: buildTestHelperLogic(),
    sets: TEST_SETS,
    translate: buildTranslate({
      "helper.set.testCards.card1": "First card",
      "helper.set.testCards.card3": "Third card",
    }),
  };
  it("resolves selected indices against their source set, not alias or numeric IDs", () => {
    expect(formatVariable("bonus", [2, 0], context)).toEqual([
      "Third card",
      "First card",
    ]);
  });
  it("uses the full key when a translation is missing", () => {
    expect(formatVariable("bonus", [1], context)).toEqual([
      "helper.set.testCards.card2",
    ]);
  });
});
