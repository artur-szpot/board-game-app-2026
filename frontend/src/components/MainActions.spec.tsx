import { screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../utils/test-utils";
import { MainActions } from "./MainActions";

const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

const ErrorForm = () => {
  const [showErrors, setShowErrors] = useState(false);
  return (
    <>
      <input aria-label="Other form" aria-invalid="true" />
      <div className="form-screen">
        <div hidden>
          <input aria-invalid="true" />
        </div>
        <input aria-label="First field" aria-invalid={showErrors} />
        <input aria-label="Second field" aria-invalid={showErrors} />
        <MainActions
          frameId="error-form"
          confirmEnabled={false}
          confirmCallback={() => undefined}
          errorCount={2}
          onShowErrors={() => setShowErrors(true)}
        />
      </div>
    </>
  );
};

describe("MainActions error navigation", () => {
  beforeEach(() => scrollIntoView.mockClear());

  it("scrolls after revealing errors, ignoring hidden fields and other forms", async () => {
    const { user } = renderWithProviders(<ErrorForm />);
    expect(scrollIntoView).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Show 2 form errors" }),
    );
    expect(
      screen.getByRole("textbox", { name: "First field" }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({
      behavior: "smooth",
      block: "center",
    });
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByRole("textbox", { name: "First field" }),
    );

    await user.click(
      screen.getByRole("button", { name: "Show 2 form errors" }),
    );
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("scrolls to a selection field with error messages but no invalid input", async () => {
    const { user } = renderWithProviders(
      <div className="form-screen">
        <div data-testid="selection-field">
          <button>Choose</button>
          <ul className="form-field-errors">
            <li>Select an option</li>
          </ul>
        </div>
        <MainActions
          frameId="selection-form"
          confirmEnabled={false}
          confirmCallback={() => undefined}
          errorCount={1}
        />
      </div>,
    );
    await user.click(
      screen.getByRole("button", { name: "Show 1 form errors" }),
    );
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByTestId("selection-field"),
    );
  });
});
