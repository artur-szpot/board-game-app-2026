import { describe, expect, it } from "vitest"

import type { FormScreenValues } from "../../components/screens/FormScreenProps"
import type { SelectionResult } from "../../components/screens/selection-strategies"
import {
  ActionEnum,
  buildChoiceMadeFromItems,
  buildFormFilledFromForm,
  resultMapper,
} from "./frame-actions"

describe("frame-actions", () => {
  it("builds and maps a choice-made payload", () => {
    const chosen: SelectionResult[] = [
      { type: "tag", value: "tag-1", name: "Strategy" },
    ]
    const result = buildChoiceMadeFromItems(chosen)

    expect(result).toEqual({
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen },
    })
    expect(resultMapper.toChoiceMade(result)).toEqual({
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen },
    })
  })

  it("builds and maps a form-filled payload", () => {
    const values: FormScreenValues = {
      stringValues: { playerCount: "4" },
      booleanValues: { published: true },
      selectionValues: {},
    }
    const result = buildFormFilledFromForm(values)

    expect(result).toEqual({
      action: ActionEnum.FORM_FILLED,
      payload: { values },
    })
    expect(resultMapper.toFormFilled(result)).toEqual({
      action: ActionEnum.FORM_FILLED,
      payload: { values },
    })
  })

  it("throws when mapping the wrong action type", () => {
    const formResult = buildFormFilledFromForm({
      stringValues: { title: "Brass" },
      booleanValues: {},
      selectionValues: {},
    })
    const choiceResult = buildChoiceMadeFromItems([])

    expect(() => resultMapper.toChoiceMade(formResult)).toThrow(
      "Trying to map FORM_FILLED to a CHOICE_MADE",
    )
    expect(() => resultMapper.toFormFilled(choiceResult)).toThrow(
      "Trying to map CHOICE_MADE to a FORM_FILLED",
    )
  })
})