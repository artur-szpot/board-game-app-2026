import { describe, expect, it } from "vitest";

import { buildTranslate, collectLabelKeys, interpolate } from "./helper-i18n";
import { buildTestHelperLogic, TEST_SETS } from "./test-helper-logic";

describe("helper i18n", () => {
  it("collects UI, display, enum and set item keys", () => {
    const keys = collectLabelKeys(buildTestHelperLogic(), TEST_SETS);

    expect(keys).toEqual(
      expect.arrayContaining([
        "helper.ui.ok",
        "helper.general.firstPlayer",
        "helper.game.test.enum.testMode.coffee",
        "helper.game.test.enum.testExpansion.north",
        "helper.set.testCards.card1",
        "helper.set.testCards.card2",
        "helper.set.testCards.card3",
      ]),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("interpolates parameters and keeps unknown placeholders", () => {
    expect(interpolate("Card {{n}} of {{ total }}", { n: 2, total: 5 })).toBe(
      "Card 2 of 5",
    );
    expect(interpolate("Card {{n}}")).toBe("Card {{n}}");
  });

  it("prefers translations, then UI defaults, then the raw code", () => {
    const translate = buildTranslate({ "helper.ui.ok": "Dobrze" });

    expect(translate("helper.ui.ok")).toBe("Dobrze");
    expect(translate(["helper.ui.tooFew", { min: 2 }])).toBe(
      "Choose at least 2",
    );
    expect(translate(["helper.game.x", { n: 1 }])).toBe(
      'helper.game.x {"n":1}',
    );
  });
});
