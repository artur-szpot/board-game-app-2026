import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Helper logic blew up");
  }
  return <div>All good</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("renders children while nothing fails", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("shows the failure message instead of crashing the tree", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Helper logic blew up")).toBeTruthy();
  });

  it("retries rendering when the user asks for it", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setShouldThrow(false)}>
            Fix
          </button>
          <ErrorBoundary>
            <Boom shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    };

    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Fix" }));
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("All good")).toBeTruthy();
  });
});
