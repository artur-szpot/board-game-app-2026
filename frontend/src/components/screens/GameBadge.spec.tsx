import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { BadgeTypeEnum, GameBadge } from "./GameBadge";

describe("GameBadge", () => {
  it("renders a link when a target is provided", () => {
    render(
      <MemoryRouter>
        <GameBadge
          type={BadgeTypeEnum.TAG}
          value="Strategy"
          to="/collection/tags/tag-1"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Strategy" })).toHaveAttribute(
      "href",
      "/collection/tags/tag-1",
    );
  });

  it("renders plain text when no target is provided", () => {
    render(
      <MemoryRouter>
        <GameBadge type={BadgeTypeEnum.GAME_LENGTH} value="LONG" />
      </MemoryRouter>,
    );

    expect(screen.getByText("LONG")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
