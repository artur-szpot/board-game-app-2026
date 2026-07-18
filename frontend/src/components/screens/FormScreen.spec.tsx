import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { formCheckbox } from "../forms/FormCheckboxField"
import { formOptions } from "../forms/FormOptionsField"
import { formSearch } from "../forms/FormSearchField"
import { formText } from "../forms/FormTextField"
import {
  buildChoiceMadeFromItems,
  buildFormFilledFromForm,
} from "../../store/features/frame-actions"
import {
  closeFrame,
  openOptionsFrame,
  openSearchFrame,
} from "../../store/features/frameStackSlice"
import { FormScreen } from "./FormScreen"
import type { FormScreenPropsFull } from "./FormScreenProps"
import { selectionStrategySelectNumber } from "./selection-strategies"

const mockDispatch = vi.fn()

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}))

const isOptionsAction = (
  action: unknown,
): action is ReturnType<typeof openOptionsFrame> =>
  typeof action === "object" &&
  action !== null &&
  "type" in action &&
  action.type === openOptionsFrame.type

const isSearchAction = (
  action: unknown,
): action is ReturnType<typeof openSearchFrame> =>
  typeof action === "object" &&
  action !== null &&
  "type" in action &&
  action.type === openSearchFrame.type

describe("FormScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset()
  })

  it("collects field values and closes with the filled form payload", async () => {
    const user = userEvent.setup()

    render(
      <FormScreen
        frameId="form-1"
        title="Create game"
        fields={[
          formText({ name: "title", label: "Title", required: true }),
          formCheckbox({ name: "published", label: "Published", checked: false }),
          formOptions({
            name: "tags",
            label: "Tags",
            params: {
              title: "Pick tags",
              dataType: "tag",
              strategy: selectionStrategySelectNumber({ exact: 1 }),
              options: [{ label: "Strategy", value: "tag-1" }],
            },
          }),
          formSearch({
            name: "helpers",
            label: "Helpers",
            params: {
              title: "Find helpers",
              dataTypes: ["helper"],
              strategy: selectionStrategySelectNumber({ exact: 1 }),
            },
          }),
        ]}
      />,
    )

    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    expect(confirmButton).toBeDisabled()

    await user.type(screen.getByLabelText("Title"), "Brass")
    await user.click(screen.getByLabelText("Published"))
    await user.click(screen.getByRole("button", { name: "Choose" }))
    await user.click(screen.getByRole("button", { name: "Search for options" }))

    const dispatchedActions = mockDispatch.mock.calls.map(
      ([action]) => action as unknown,
    )
    const optionsAction = dispatchedActions.find(isOptionsAction)
    const searchAction = dispatchedActions.find(isSearchAction)

    expect(optionsAction).toBeDefined()
    expect(searchAction).toBeDefined()

    act(() => {
      optionsAction?.payload.callbackEmitter?.(
        buildChoiceMadeFromItems([
          { type: "tag", value: "tag-1", name: "Strategy" },
        ]),
      )
      searchAction?.payload.callbackEmitter?.(
        buildChoiceMadeFromItems([
          { type: "helper", value: "helper-1", name: "Auto Score" },
        ]),
      )
    })

    expect(screen.getByText(/Chosen: Strategy/)).toBeInTheDocument()
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)

    expect(mockDispatch).toHaveBeenLastCalledWith(
      closeFrame({
        id: "form-1",
        result: buildFormFilledFromForm({
          stringValues: { title: "Brass" },
          booleanValues: { published: true },
          selectionValues: {
            tags: [{ type: "tag", value: "tag-1", name: "Strategy" }],
            helpers: [{ type: "helper", value: "helper-1", name: "Auto Score" }],
          },
        }),
      }),
    )
  })

  it("restores cached draft state when reopened with the same frame id", async () => {
    const user = userEvent.setup()

    const props: FormScreenPropsFull = {
      frameId: "draft-form",
      title: "Edit game",
      fields: [
        formText({ name: "title", label: "Title", required: true }),
        formCheckbox({ name: "published", label: "Published", checked: false }),
      ],
    }

    const firstRender = render(<FormScreen {...props} />)

    await user.type(screen.getByLabelText("Title"), "Azul")
    await user.click(screen.getByLabelText("Published"))

    firstRender.unmount()

    render(<FormScreen {...props} />)

    expect(screen.getByLabelText("Title")).toHaveValue("Azul")
    expect(screen.getByLabelText("Published")).toBeChecked()
  })
})