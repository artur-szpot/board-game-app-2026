import { describe, expect, it } from "vitest"

import {
  isConfirmAllowed,
  isSelectionCorrect,
  SelectionStrategyEnum,
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "./selection-strategies"

describe("selection-strategies", () => {
  it("marks choose-one as non-confirmable and only valid with one choice", () => {
    const strategy = selectionStrategyChooseOne()

    expect(strategy).toEqual({ strategy: SelectionStrategyEnum.CHOOSE_ONE })
    expect(isConfirmAllowed(strategy)).toBe(false)
    expect(isSelectionCorrect(strategy, 0)).toBe(false)
    expect(isSelectionCorrect(strategy, 1)).toBe(true)
    expect(isSelectionCorrect(strategy, 2)).toBe(false)
  })

  it("validates select-number inputs", () => {
    expect(() => selectionStrategySelectNumber({})).toThrow(
      "At least one value must be set",
    )
    expect(() => selectionStrategySelectNumber({ min: 1, exact: 1 })).toThrow(
      "Either min/max or exact need to be set, never both",
    )
    expect(() => selectionStrategySelectNumber({ exact: 0 })).toThrow(
      "Exact must be a positive integer",
    )
    expect(() => selectionStrategySelectNumber({ min: -1 })).toThrow(
      "Min must be a positive integer or zero",
    )
    expect(() => selectionStrategySelectNumber({ max: 0 })).toThrow(
      "Max must be a positive integer or zero",
    )
    expect(() => selectionStrategySelectNumber({ min: 2, max: 2 })).toThrow(
      "Max must be greater than min (use exact if precise target is known)",
    )
  })

  it("accepts min and max boundaries for multi-select", () => {
    const strategy = selectionStrategySelectNumber({ min: 1, max: 3 })

    expect(isConfirmAllowed(strategy)).toBe(true)
    expect(isSelectionCorrect(strategy, 0)).toBe(false)
    expect(isSelectionCorrect(strategy, 1)).toBe(true)
    expect(isSelectionCorrect(strategy, 3)).toBe(true)
    expect(isSelectionCorrect(strategy, 4)).toBe(false)
  })

  it("enforces exact selection counts", () => {
    const strategy = selectionStrategySelectNumber({ exact: 2 })

    expect(isSelectionCorrect(strategy, 1)).toBe(false)
    expect(isSelectionCorrect(strategy, 2)).toBe(true)
    expect(isSelectionCorrect(strategy, 3)).toBe(false)
  })
})