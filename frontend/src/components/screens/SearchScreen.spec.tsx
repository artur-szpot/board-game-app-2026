import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"

import axios from "axios"

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions"
import { closeFrame } from "../../store/features/frameStackSlice"
import { SearchScreen } from "./SearchScreen"
import {
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "./selection-strategies"

const mockDispatch = vi.fn()

vi.mock("axios")
vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}))

describe("SearchScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("debounces search requests and closes immediately for choose-one results", async () => {
    const getSpy = vi.spyOn(axios, "get")
    getSpy.mockResolvedValue({
      data: {
        results: [{ type: "game", value: "game-1", name: "Brass" }],
      },
    } as Awaited<ReturnType<typeof axios.get>>)

    render(
      <SearchScreen
        frameId="search-1"
        title="Find game"
        dataTypes={["game"]}
        strategy={selectionStrategyChooseOne()}
      />,
    )

    fireEvent.change(screen.getByLabelText("Search term"), {
      target: { value: "Brass" },
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
    })
    expect(getSpy).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining("/game-api/search"),
      {
        params: {
          types: ["game"],
          searchTerm: "Brass",
        },
      },
    )

    expect(
      screen.getByRole("button", { name: "Brass (game)" }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Brass (game)" }))

    expect(mockDispatch).toHaveBeenCalledWith(
      closeFrame({
        id: "search-1",
        result: buildChoiceMadeFromItems([
          { type: "game", value: "game-1", name: "Brass" },
        ]),
      }),
    )
  })

  it("enables confirm for valid multi-select search results", async () => {
    const getSpy = vi.spyOn(axios, "get")
    getSpy.mockResolvedValue({
      data: {
        results: [
          { type: "helper", value: "helper-1", name: "Auto Score" },
          { type: "helper", value: "helper-2", name: "Tie Break" },
        ],
      },
    } as Awaited<ReturnType<typeof axios.get>>)

    render(
      <SearchScreen
        frameId="search-2"
        title="Find helpers"
        dataTypes={["helper"]}
        strategy={selectionStrategySelectNumber({ exact: 2 })}
        currentSelection={[
          { type: "helper", value: "helper-1", name: "Auto Score" },
        ]}
        initialSearchTerm="Auto"
      />,
    )

    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    expect(confirmButton).toBeDisabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(
      screen.getByRole("button", { name: "Tie Break (helper)" }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Tie Break (helper)" }))

    expect(confirmButton).toBeEnabled()

    fireEvent.click(confirmButton)

    expect(mockDispatch).toHaveBeenLastCalledWith(
      closeFrame({
        id: "search-2",
        result: buildChoiceMadeFromItems([
          { type: "helper", value: "helper-1", name: "Auto Score" },
          { type: "helper", value: "helper-2", name: "Tie Break" },
        ]),
      }),
    )
  })
})