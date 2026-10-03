import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { openSetEditorFrame } from "../../store/features/frameStackSlice";
import { makeStore } from "../../store/store";
import { renderWithProviders } from "../../utils/test-utils";
import { FrameStackScreenWrapper } from "./FrameStackScreenWrapper";

describe("set editor frame rendering", () => {
  it("renders the editor instead of route content, then returns on cancellation", async () => {
    const store = makeStore();
    store.dispatch(openSetEditorFrame({ params: {} }));
    const { user } = renderWithProviders(
      <FrameStackScreenWrapper>
        <p>Route content</p>
      </FrameStackScreenWrapper>,
      { store },
    );
    expect(
      screen.getByRole("region", { name: "helper data set editor" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Route content")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Route content")).toBeInTheDocument();
  });
});
