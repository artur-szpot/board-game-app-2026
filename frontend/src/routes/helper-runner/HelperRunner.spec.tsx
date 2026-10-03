import { screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildTestHelperLogic,
  TEST_SETS,
} from "../../components/helper-runner/test-helper-logic";
import type { RunnerSetDto } from "../../dto/helper-logic.dto";
import { PermissionLevel, PermissionType } from "../../dto/user-data.dto";
import { renderWithProviders } from "../../utils/test-utils";
import { HelperRunner } from "./HelperRunner";

vi.mock("axios");
const get = vi.spyOn(axios, "get");
vi.mock("../../components/helper-runner/HelperRunnerView", () => ({
  HelperRunnerView: ({ sets }: { sets: Record<string, RunnerSetDto> }) => (
    <p>
      {sets.bonusCards.name}: {sets.bonusCards.items[0].name}
    </p>
  ),
}));

const renderRunner = (gameId?: string, hasDataPermission = true) =>
  renderWithProviders(
    <MemoryRouter
      initialEntries={[
        `/collection/helpers/helper-1${gameId ? `?gameId=${gameId}` : ""}`,
      ]}
    >
      <Routes>
        <Route path="/collection/helpers/:id" element={<HelperRunner />} />
      </Routes>
    </MemoryRouter>,
    {
      preloadedState: {
        currentUser: {
          permissions: hasDataPermission
            ? [
                {
                  permissionType: PermissionType.DATA_MANAGEMENT,
                  permissionLevel: PermissionLevel.READ,
                },
              ]
            : [],
        },
      },
    },
  );

describe("HelperRunner set loading", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValueOnce({
      data: { id: "helper-1", name: "Test", logic: buildTestHelperLogic() },
    });
  });
  it("retains the actual set name separately from the helper alias", async () => {
    const { name, ...data } = TEST_SETS.bonusCards;
    get.mockResolvedValueOnce({ data: { name, data } });
    renderRunner();
    expect(await screen.findByText("testCards: card1")).toBeInTheDocument();
    expect(get).toHaveBeenLastCalledWith(
      expect.stringContaining("/sets/set-1"),
      expect.anything(),
    );
  });
  it("reports legacy data instead of rendering an empty or invalid set", async () => {
    get.mockResolvedValueOnce({
      data: {
        name: "oldCards",
        data: { items: [{ value: 1, label: ["old.card"] }] },
      },
    });

    renderRunner();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      'Data set "oldCards" uses an unsupported format',
    );
    expect(screen.queryByText("testCards: card1")).not.toBeInTheDocument();
  });

  it("blocks direct runner access without DATA_MANAGEMENT and makes no API requests", async () => {
    renderRunner(undefined, false);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "DATA_MANAGEMENT READ",
    );
    expect(get).not.toHaveBeenCalled();
  });

  it("runs assigned helpers through the game-scoped endpoint without management access", async () => {
    get.mockReset();
    const { name, ...data } = TEST_SETS.bonusCards;
    get.mockResolvedValueOnce({
      data: {
        helper: { id: "helper-1", name: "Test", logic: buildTestHelperLogic() },
        sets: [{ id: "set-1", name, data }],
      },
    });
    renderRunner("game-1", false);
    expect(await screen.findByText("testCards: card1")).toBeInTheDocument();
    expect(get).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("/games/game-1/helpers/helper-1"),
      expect.anything(),
    );
  });
});
