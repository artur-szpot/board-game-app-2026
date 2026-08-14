import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerFormScreenAsyncValidators } from "../../store/features/formScreenAsyncValidatorRegistry";
import { formCheckbox } from "../forms/FormCheckboxField";
import { formText } from "../forms/FormTextField";
import { FormScreen } from "./FormScreen";
import type { FormAsyncValidator } from "./FormScreenProps";
import { STABILITY_IN_MS } from "./useFormAsyncValidators";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const mockDispatch = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => "test-token",
}));

const nameTakenValidator: FormAsyncValidator = {
  name: "tagNameTaken",
  url: "game-api/tags/check",
  watchedFields: ["name", "public"],
  targetField: "name",
  errorMessage: "This tag name is already taken",
  buildBody: values => ({
    name: values.stringValues.name,
    public: values.booleanValues.public,
  }),
};

const renderTagForm = (frameId: string, initialName = "Strategy") => {
  registerFormScreenAsyncValidators(frameId, [nameTakenValidator]);
  return render(
    <FormScreen
      frameId={frameId}
      title="Add a new tag"
      action="game-api/tags"
      method="POST"
      fields={[
        formText({
          name: "name",
          label: "Tag name",
          required: true,
          initialValue: initialName,
        }),
        formCheckbox({ name: "public", label: "Public tag", checked: false }),
      ]}
    />,
  );
};

describe("FormScreen async validators", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockedAxios.mockReset();
    mockedAxios.mockResolvedValue({} as never);
    mockedAxios.post = vi.fn();
    mockedAxios.isCancel = vi.fn(() => false) as never;
  });

  it("waits for the values to settle before querying", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockedAxios.post = vi
      .fn()
      .mockResolvedValue({ data: { checkPassed: true } });

    renderTagForm("settling-form");

    expect(mockedAxios.post).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(STABILITY_IN_MS);
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("game-api/tags/check"),
      { name: "Strategy", public: false },
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    );
    vi.useRealTimers();
  });

  it("shows the loader while checking and the message on failure", async () => {
    const user = userEvent.setup();
    mockedAxios.post = vi
      .fn()
      .mockResolvedValue({ data: { checkPassed: false } });

    renderTagForm("failing-check-form");

    expect(
      screen.getByRole("progressbar", { name: "Checking Tag name" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByText("This tag name is already taken"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("progressbar", { name: "Checking Tag name" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show 1 form errors" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();

    await user.type(screen.getByLabelText("Tag name"), "X");

    expect(
      screen.queryByText("This tag name is already taken"),
    ).not.toBeInTheDocument();
  });

  it("skips the check while the target field is empty", async () => {
    const user = userEvent.setup();
    mockedAxios.post = vi
      .fn()
      .mockResolvedValue({ data: { checkPassed: true } });

    renderTagForm("empty-target-form", "");

    expect(
      screen.queryByRole("progressbar", { name: "Checking Tag name" }),
    ).not.toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Tag name"), "Strategy");

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  it("leaves the field clean when the check passes", async () => {
    mockedAxios.post = vi
      .fn()
      .mockResolvedValue({ data: { checkPassed: true } });

    renderTagForm("passing-check-form");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
    });

    expect(
      screen.queryByText("This tag name is already taken"),
    ).not.toBeInTheDocument();
  });

  it("does not block the form when the request fails", async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error("Network down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderTagForm("network-error-form");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
