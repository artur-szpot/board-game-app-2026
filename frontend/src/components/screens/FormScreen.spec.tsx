import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import {
  closeFrame,
  openOptionsFrame,
  openSearchFrame,
} from "../../store/features/frameStackSlice";
import { formCheckbox } from "../forms/FormCheckboxField";
import { formOptions } from "../forms/FormOptionsField";
import { formSearch } from "../forms/FormSearchField";
import { formText } from "../forms/FormTextField";
import { FormScreen } from "./FormScreen";
import type { FormScreenPropsFull } from "./FormScreenProps";
import {
  GameDataType,
  ResultMappingStrategy,
  selectionStrategySelectNumber,
} from "./selection-strategies";

vi.mock("axios");

const mockDispatch = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

const isOptionsAction = (
  action: unknown,
): action is ReturnType<typeof openOptionsFrame> =>
  typeof action === "object" &&
  action !== null &&
  "type" in action &&
  action.type === openOptionsFrame.type;

const isSearchAction = (
  action: unknown,
): action is ReturnType<typeof openSearchFrame> =>
  typeof action === "object" &&
  action !== null &&
  "type" in action &&
  action.type === openSearchFrame.type;

describe("FormScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it("collects field values and closes with the filled form payload", async () => {
    const user = userEvent.setup();

    render(
      <FormScreen
        frameId="form-1"
        title="Create game"
        method="POST"
        action="some/url"
        fields={[
          formText({ name: "title", label: "Title", required: true }),
          formCheckbox({
            name: "published",
            label: "Published",
            checked: false,
          }),
          formOptions({
            name: "tags",
            label: "Tags",
            resultMapping: ResultMappingStrategy.VALUES_ONLY,
            params: {
              title: "Pick tags",
              dataType: GameDataType.TAG,
              strategy: selectionStrategySelectNumber({ exact: 1 }),
              options: [{ label: "Strategy", value: "tag-1" }],
            },
          }),
          formSearch({
            name: "helpers",
            label: "Helpers",
            resultMapping: ResultMappingStrategy.VALUES_ONLY,
            params: {
              title: "Find helpers",
              dataTypes: [GameDataType.HELPER],
              strategy: selectionStrategySelectNumber({ exact: 1 }),
            },
          }),
        ]}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "Brass");
    await user.click(screen.getByLabelText("Published"));
    await user.click(screen.getByRole("button", { name: "Choose" }));
    await user.click(
      screen.getByRole("button", { name: "Search for options" }),
    );

    const dispatchedActions = mockDispatch.mock.calls.map(
      ([action]) => action as unknown,
    );
    const optionsAction = dispatchedActions.find(isOptionsAction);
    const searchAction = dispatchedActions.find(isSearchAction);

    expect(optionsAction).toBeDefined();
    expect(searchAction).toBeDefined();

    act(() => {
      optionsAction?.payload.callbackEmitter?.(
        buildChoiceMadeFromItems([
          { type: GameDataType.TAG, value: "tag-1", name: "Strategy" },
        ]),
      );
      searchAction?.payload.callbackEmitter?.(
        buildChoiceMadeFromItems([
          { type: GameDataType.HELPER, value: "helper-1", name: "Auto Score" },
        ]),
      );
    });

    expect(screen.getByText(/Chosen: Strategy/)).toBeInTheDocument();
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    expect(mockDispatch).toHaveBeenLastCalledWith(
      closeFrame({
        id: "form-1",
      }),
    );
  });

  it("restores cached draft state when reopened with the same frame id", async () => {
    const user = userEvent.setup();

    const props: FormScreenPropsFull = {
      frameId: "draft-form",
      title: "Edit game",
      action: "some/url",
      method: "POST",
      fields: [
        formText({ name: "title", label: "Title", required: true }),
        formCheckbox({ name: "published", label: "Published", checked: false }),
      ],
    };

    const firstRender = render(<FormScreen {...props} />);

    await user.type(screen.getByLabelText("Title"), "Azul");
    await user.click(screen.getByLabelText("Published"));

    firstRender.unmount();

    render(<FormScreen {...props} />);

    expect(screen.getByLabelText("Title")).toHaveValue("Azul");
    expect(screen.getByLabelText("Published")).toBeChecked();
  });
});
