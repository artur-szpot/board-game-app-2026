import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions"
import { closeFrame } from "../../store/features/frameStackSlice"
import { OptionsScreen } from "./OptionsScreen"
import {
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "./selection-strategies"

const mockDispatch = vi.fn()

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}))

describe("OptionsScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset()
  })

  it("closes immediately with one chosen option for choose-one strategy", async () => {
    const user = userEvent.setup()

    render(
      <OptionsScreen
        frameId="frame-1"
        dataType="tag"
        title="Pick a tag"
        strategy={selectionStrategyChooseOne()}
        options={[
          { label: "Strategy", value: "tag-1" },
          { label: "Family", value: "tag-2" },
        ]}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Family" }))

    expect(mockDispatch).toHaveBeenCalledWith(
      closeFrame({
        id: "frame-1",
        result: buildChoiceMadeFromItems([
          { type: "tag", value: "tag-2", name: "Family" },
        ]),
      }),
    )
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument()
  })

  it("tracks multi-select state and only enables confirm when selection is valid", async () => {
    const user = userEvent.setup()

    render(
      <OptionsScreen
        frameId="frame-2"
        dataType="location"
        title="Pick locations"
        strategy={selectionStrategySelectNumber({ min: 2, max: 3 })}
        options={[
          { label: "Table", value: "loc-1", chosen: true },
          { label: "Shelf", value: "loc-2" },
          { label: "Cafe", value: "loc-3" },
        ]}
      />,
    )

    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    expect(confirmButton).toBeDisabled()
    expect(
      screen.getByRole("button", { name: /^\[CHOSEN\]\s*Table$/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Shelf" }))

    expect(confirmButton).toBeEnabled()
    expect(
      screen.getByRole("button", { name: /^\[CHOSEN\]\s*Table$/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^\[CHOSEN\]\s*Shelf$/ }),
    ).toBeInTheDocument()

    await user.click(confirmButton)

    expect(mockDispatch).toHaveBeenCalledWith(
      closeFrame({
        id: "frame-2",
        result: buildChoiceMadeFromItems([
          { type: "location", value: "loc-1", name: "Table" },
          { type: "location", value: "loc-2", name: "Shelf" },
        ]),
      }),
    )
  })
})