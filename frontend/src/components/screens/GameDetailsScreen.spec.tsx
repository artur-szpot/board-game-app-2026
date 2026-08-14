import { render, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameDetailsScreen } from "./GameDetailsScreen";

vi.mock("axios");

const mockDispatch = vi.fn();

type MockState = {
  currentUser: {
    accessToken?: string;
    id?: string;
    permissions?: {
      permissionType: string;
      permissionLevel?: "READ" | "FULL";
    }[];
  };
};

let mockState: MockState = {
  currentUser: { accessToken: "test-token", id: "user-1" },
};

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: MockState) => unknown) =>
    selector(mockState),
}));

const game = {
  id: "game-1",
  ownerId: "user-1",
  private: true,
  name: "Brass",
  description: "Industrial strategy",
  length: "LONG",
  minPlayers: 2,
  maxPlayers: 4,
  tags: [{ id: "tag-1", name: "Strategy", description: "Thinky games" }],
  locations: [
    {
      locationId: "location-1",
      isGameId: false,
      path: [
        { id: "room-1", name: "Room" },
        { id: "location-1", name: "Shelf B2" },
      ],
    },
    {
      locationId: "game-2",
      isGameId: true,
      path: [{ id: "game-2", name: "Gloomhaven box" }],
    },
  ],
  scoringSchemaIds: [],
  scoringSchemas: [],
  helperIds: [],
  helpers: [],
  createdOn: "2026-01-01",
  updatedOn: "2026-01-01",
};

describe("GameDetailsScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockDispatch.mockReset();
    mockState = { currentUser: { accessToken: "test-token", id: "user-1" } };
  });

  it("links tag badges and location entries to their detail routes", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({ data: game } as never);

    render(
      <MemoryRouter>
        <GameDetailsScreen
          gameId="game-1"
          openedAsFrame={false}
          frameId="frame-1"
        />
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Brass" });

    expect(screen.getByRole("link", { name: "Strategy" })).toHaveAttribute(
      "href",
      "/collection/tags/tag-1",
    );
    expect(screen.getByRole("link", { name: /Shelf B2/ })).toHaveAttribute(
      "href",
      "/collection/locations/location-1",
    );
    expect(
      screen.getByRole("link", { name: /Gloomhaven box/ }),
    ).toHaveAttribute("href", "/collection/games/game-2");
  });
});
