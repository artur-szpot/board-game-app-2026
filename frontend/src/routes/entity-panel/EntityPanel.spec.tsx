import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameDataType } from "../../components/screens/selection-strategies";
import { makeStore } from "../../store/store";
import { useListSearch } from "../../utils/list-return-state";

import { EntityPanel } from "./EntityPanel";
import type { EntityPanelTab } from "./entity-panel-types";

const { mockedPost } = vi.hoisted(() => ({
  mockedPost:
    vi.fn<
      (
        url: string,
        body: { pagination: { pageNumber: number; pageSize: number } },
      ) => Promise<unknown>
    >(),
}));

vi.mock("axios", () => ({
  default: {
    post: mockedPost,
    delete: vi.fn(),
  },
}));

type TestItem = { id: string; name: string };

const TABS: EntityPanelTab<GameDataType.GAME, TestItem>[] = [
  {
    category: GameDataType.GAME,
    routeSegment: "games",
    label: "Games",
    viewPath: item => `/collection/games/${item.id}`,
  },
];

const LocationProbe = () => {
  const location = useLocation();
  return (
    <>
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
      <div data-testid="list-search">{useListSearch()}</div>
    </>
  );
};

const renderPanel = (initialEntry: string) => {
  const store = makeStore({ currentUser: { accessToken: "test-token" } });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationProbe />
        <Routes>
          <Route
            path="/collection/games"
            element={
              <EntityPanel<
                GameDataType.GAME,
                TestItem,
                Record<GameDataType.GAME, TestItem>
              >
                title="Collection panel"
                basePath="/collection"
                searchEndpoint="game-api/search"
                tabs={TABS}
                content={GameDataType.GAME}
              />
            }
          />
          <Route path="/collection/games/:id" element={<div>Details</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const lastPagination = () => {
  return mockedPost.mock.calls.at(-1)?.[1].pagination;
};

describe("EntityPanel pagination", () => {
  beforeEach(() => {
    mockedPost.mockReset();
    mockedPost.mockResolvedValue({
      data: {
        total: 30,
        results: [
          { id: "game-1", name: "Brass", type: GameDataType.GAME },
          { id: "game-2", name: "Scythe", type: GameDataType.GAME },
        ],
      },
    });
  });

  it("reads the one-based page and page size from the URL", async () => {
    renderPanel("/collection/games?page=2&pageSize=10");

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());

    expect(lastPagination()).toEqual({ pageNumber: 1, pageSize: 10 });
  });

  it("falls back to defaults for missing or invalid parameters", async () => {
    renderPanel("/collection/games?page=nonsense&pageSize=7");

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());

    expect(lastPagination()).toEqual({ pageNumber: 0, pageSize: 3 });
  });

  it("writes the page to the URL when the pagination control is used", async () => {
    const user = userEvent.setup();
    renderPanel("/collection/games");

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());

    await user.click(
      await screen.findByRole("button", { name: /go to page 2/i }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        "/collection/games?page=2",
      ),
    );
    await waitFor(() =>
      expect(lastPagination()).toEqual({ pageNumber: 1, pageSize: 3 }),
    );
  });

  it("keeps the page size in the URL and rebases the page", async () => {
    const user = userEvent.setup();
    renderPanel("/collection/games?page=3");

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "10" }));

    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        "/collection/games?pageSize=10",
      ),
    );
  });

  it("navigates to a clean item route and keeps pagination in history state", async () => {
    const user = userEvent.setup();
    renderPanel("/collection/games?page=2&pageSize=10");

    const viewButtons = await screen.findAllByRole("button", {
      name: "View item",
    });
    await user.click(viewButtons[0]);

    expect(screen.getByTestId("location").textContent).toBe(
      "/collection/games/game-1",
    );
    expect(screen.getByTestId("list-search").textContent).toBe(
      "page=2&pageSize=10",
    );
  });
});
