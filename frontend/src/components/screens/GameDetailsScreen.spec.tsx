import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameDetailsScreen } from "./GameDetailsScreen";
import { buildTestHelperLogic } from "../helper-runner/test-helper-logic";

vi.mock("axios");

const mockDispatch = vi.fn();
const RunnerPage = () => <p>Runner page {useLocation().search}</p>;

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
    vi.spyOn(axios, "get").mockResolvedValue({ data: { page: [] } });
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

  it("runs the only helper directly", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: {
        ...game,
        helperIds: ["helper-1"],
        helpers: [
          { id: "helper-1", name: "Setup", logic: buildTestHelperLogic() },
        ],
      },
    } as never);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/collection/games/game-1"]}>
        <Routes>
          <Route
            path="/collection/games/:id"
            element={
              <GameDetailsScreen
                gameId="game-1"
                openedAsFrame={false}
                frameId="frame-1"
              />
            }
          />
          <Route path="/collection/helpers/:id" element={<RunnerPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: "Run helper" }));

    expect(
      await screen.findByText("Runner page ?gameId=game-1"),
    ).toBeInTheDocument();
  });

  it("shows assigned data without management links when permission is missing", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: {
        ...game,
        helpers: [
          { id: "helper-1", name: "Setup", logic: buildTestHelperLogic() },
        ],
      },
    });
    render(
      <MemoryRouter>
        <GameDetailsScreen
          gameId="game-1"
          openedAsFrame={false}
          frameId="frame-1"
        />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("Data set: bonusCards")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View helper definition" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View data set bonusCards" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run helper" })).toBeEnabled();
  });

  it("READ opens assigned helper and set definition forms read-only", async () => {
    mockState.currentUser.permissions = [
      { permissionType: "DATA_MANAGEMENT", permissionLevel: "READ" },
    ];
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce({
        data: {
          ...game,
          helpers: [
            { id: "helper-1", name: "Setup", logic: buildTestHelperLogic() },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { page: [] } })
      .mockResolvedValueOnce({
        data: {
          id: "set-1",
          name: "people",
          data: { properties: ["city"], items: [] },
        },
      });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GameDetailsScreen
          gameId="game-1"
          openedAsFrame={false}
          frameId="frame-1"
        />
      </MemoryRouter>,
    );
    await user.click(
      await screen.findByRole("button", { name: "View helper definition" }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "frameStack/openFormFrame",
        payload: expect.objectContaining({
          params: expect.objectContaining({ readOnly: true }) as object,
        }) as object,
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "View data set bonusCards" }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "frameStack/openSetEditorFrame",
        payload: expect.objectContaining({
          params: expect.objectContaining({ readOnly: true }) as object,
        }) as object,
      }),
    );
  });

  it("disables running helpers when the game has none", async () => {
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
    expect(screen.getByRole("button", { name: "Run helper" })).toBeDisabled();
  });
});
