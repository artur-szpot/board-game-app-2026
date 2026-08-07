import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import { invokeFrameCallback } from "../../store/features/frameCallbackRegistry";
import {
    closeFrame,
    openOptionsFrame,
    openSearchFrame,
} from "../../store/features/frameStackSlice";
import { formCheckbox } from "../forms/FormCheckboxField";
import { formNumber } from "../forms/FormFieldNumericInput";
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
const mockedAxios = vi.mocked(axios);

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

const getCallbackEmitterId = (action: unknown): string | undefined => {
  if (typeof action !== "object" || action === null || !("payload" in action)) {
    return undefined;
  }

  const payload = action.payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "callbackEmitterId" in payload &&
    typeof payload.callbackEmitterId === "string"
  ) {
    return payload.callbackEmitterId;
  }

  return undefined;
};

const getNumericInput = (name: string): HTMLInputElement => {
  const input = document.getElementById(`${name}-numeric-input`);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Expected numeric input for field ${name}`);
  }
  return input;
};

describe("FormScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockedAxios.mockReset();
    mockedAxios.mockResolvedValue({} as never);
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
          formNumber({
            name: "minPlayers",
            label: "Minimum players",
            required: true,
          }),
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
    const minPlayersInput = getNumericInput("minPlayers");
    await user.type(minPlayersInput, "4");
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
      const optionsToken = getCallbackEmitterId(optionsAction);
      const searchToken = getCallbackEmitterId(searchAction);

      if (!optionsToken || !searchToken) {
        throw new Error("Missing callback token on dispatched frame actions");
      }

      invokeFrameCallback(
        optionsToken,
        buildChoiceMadeFromItems([
          { type: GameDataType.TAG, value: "tag-1", name: "Strategy" },
        ]),
      );
      invokeFrameCallback(
        searchToken,
        buildChoiceMadeFromItems([
          { type: GameDataType.HELPER, value: "helper-1", name: "Auto Score" },
        ]),
      );
    });

    expect(screen.getByText(/Strategy/)).toBeInTheDocument();
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    const requestConfig: unknown = mockedAxios.mock.calls[0]?.[0];
    expect(requestConfig).toMatchObject({
      data: {
        title: "Brass",
        minPlayers: 4,
      },
    });

    expect(mockDispatch).toHaveBeenLastCalledWith(
      closeFrame({
        id: "form-1",
      }),
    );
  });

  it("clears text fields and caches the cleared values", async () => {
    const user = userEvent.setup();
    const props: FormScreenPropsFull = {
      frameId: "clearable-form",
      title: "Edit game",
      action: "some/url",
      method: "POST",
      fields: [
        formText({
          name: "title",
          label: "Title",
          required: true,
          initialValue: "Brass",
        }),
        formNumber({
          name: "minPlayers",
          label: "Minimum players",
          required: true,
          initialValue: 4,
        }),
      ],
    };

    const firstRender = render(<FormScreen {...props} />);

    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Clear Title" }));

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Clear Title" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();

    firstRender.unmount();
    render(<FormScreen {...props} />);

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(getNumericInput("minPlayers")).toHaveValue("4");
  });

  it("increments numeric input values via spinner controls", async () => {
    const user = userEvent.setup();

    render(
      <FormScreen
        frameId="invalid-number-form"
        title="Edit game"
        action="some/url"
        method="POST"
        fields={[
          formNumber({
            name: "minPlayers",
            label: "Minimum players",
            required: true,
            initialValue: 4,
          }),
        ]}
      />,
    );

    const increaseButton = screen.getByRole("button", { name: "Increase" });
    await user.click(increaseButton);

    expect(getNumericInput("minPlayers")).toHaveValue("5");
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

  it("renders and maps additional fields for selected items", async () => {
    const user = userEvent.setup();

    render(
      <FormScreen
        frameId="form-with-selection-fields"
        title="Create game"
        method="POST"
        action="some/url"
        fields={[
          formText({ name: "title", label: "Title", required: true }),
          formSearch({
            name: "locations",
            label: "Location(s)",
            resultMapping: ResultMappingStrategy.CUSTOM,
            customMapping: item => ({
              value: item.value,
              notes: item.additionalStringFields?.notes,
              isPrimary: item.additionalBooleanFields?.isPrimary,
            }),
            params: {
              title: "Find locations",
              dataTypes: [GameDataType.LOCATION],
              strategy: selectionStrategySelectNumber({ exact: 1 }),
              additionalFields: [
                formText({
                  name: "notes",
                  label: "Notes",
                  initialValue: "seed",
                }),
                formCheckbox({
                  name: "isPrimary",
                  label: "Primary",
                  checked: false,
                }),
              ],
            },
          }),
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Title"), "Brass");
    await user.click(
      screen.getByRole("button", { name: "Search for options" }),
    );

    const dispatchedActions = mockDispatch.mock.calls.map(
      ([action]) => action as unknown,
    );
    const searchAction = dispatchedActions.find(isSearchAction);
    expect(searchAction).toBeDefined();

    act(() => {
      const searchToken = getCallbackEmitterId(searchAction);
      if (!searchToken) {
        throw new Error("Missing callback token on dispatched frame action");
      }
      invokeFrameCallback(
        searchToken,
        buildChoiceMadeFromItems([
          { type: GameDataType.LOCATION, value: "loc-1", name: "Shelf" },
        ]),
      );
    });

    const notesInput = screen.getByLabelText("Notes");
    expect(notesInput).toHaveValue("seed");
    await user.clear(notesInput);
    await user.type(notesInput, "near window");
    await user.click(screen.getByLabelText("Primary"));

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    const requestConfig: unknown = mockedAxios.mock.calls[0]?.[0];

    expect(requestConfig).toMatchObject({
      method: "POST",
      data: {
        locations: [
          {
            value: "loc-1",
            notes: "near window",
            isPrimary: true,
          },
        ],
      },
    });
  });
});
