import { screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RandomizerApi } from "../../api/randomizer";
import { renderWithProviders } from "../../utils/test-utils";
import { HelperRunnerView } from "./HelperRunnerView";
import { buildTestHelperLogic, TEST_SETS } from "./test-helper-logic";

vi.mock("axios");

const buildApi = (): RandomizerApi => ({
  getTeams: vi.fn().mockResolvedValue([{ id: "team-1", name: "Friday" }]),
  getPlayers: vi.fn().mockResolvedValue([
    { id: "p-a", name: "Ada" },
    { id: "p-b", name: "Bob" },
    { id: "p-c", name: "Cid" },
    { id: "p-d", name: "Dee" },
  ]),
  rollDice: vi.fn().mockResolvedValue([3, 4, 1, 1]),
  choose: vi.fn(async (items: number[], count: number) =>
    Promise.resolve(items.slice(-count)),
  ),
});

const renderRunner = (api = buildApi()) => ({
  api,
  ...renderWithProviders(
    <HelperRunnerView
      name="Test helper"
      logic={buildTestHelperLogic()}
      sets={TEST_SETS}
      api={api}
    />,
  ),
});

describe("HelperRunnerView", () => {
  beforeEach(() => {
    vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        translations: {
          "helper.game.test.enum.testMode.coffee": "Coffee",
          "helper.game.test.enum.testMode.vanilla": "Vanilla",
          "helper.game.test.enum.testExpansion.north": "North",
          "helper.game.test.enum.testExpansion.south": "South",
          "helper.game.test.governor": "Governor",
          "helper.game.test.mode": "Mode",
          "helper.game.test.bonus": "Bonus cards",
          "helper.set.testCards.card1": "Card 1",
          "helper.set.testCards.card2": "Card 2",
          "helper.set.testCards.card3": "Card 3",
          "helper.general.firstPlayer": "First player",
        },
        missing: ["helper.game.test.unused"],
      },
    });
  });

  it("walks through the steps with option buttons and shows the result", async () => {
    const { user, api } = renderRunner();

    await user.click(await screen.findByRole("button", { name: "Friday" }));
    expect(api.getPlayers).toHaveBeenCalledWith("team-1", undefined);

    const ok = await screen.findByRole("button", { name: "Choose at most 3" });
    expect(ok).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Dee" }));
    expect(screen.getByRole("button", { name: "Dee" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await user.click(screen.getByRole("button", { name: "OK" }));

    await user.click(await screen.findByRole("button", { name: "Coffee" }));

    expect(
      await screen.findByRole("button", { name: "Choose at least 1" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "North" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    const display = await screen.findByText("First player");
    expect(display.nextSibling).toHaveTextContent("Cid");
    expect(screen.getByText("Governor").nextSibling).toHaveTextContent("7");
    expect(screen.getByText("Mode").nextSibling).toHaveTextContent("Coffee");
    expect(screen.getByText("Card 2")).toBeInTheDocument();
    expect(screen.getByText("Card 3")).toBeInTheDocument();
    expect(api.rollDice).toHaveBeenCalledWith(4, 6, undefined);
    expect(
      screen.getByText("Missing translations: helper.game.test.unused"),
    ).toBeInTheDocument();

    vi.mocked(api.rollDice).mockResolvedValue([6, 6, 6, 6]);
    await user.click(screen.getByRole("button", { name: "Reroll" }));
    await waitFor(() => {
      expect(screen.getByText("Governor").nextSibling).toHaveTextContent("12");
    });
  });

  it("goes back to the previous choice", async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole("button", { name: "Skip" }));
    await user.click(await screen.findByRole("button", { name: "Vanilla" }));
    expect(await screen.findByRole("button", { name: "North" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByRole("button", { name: "Coffee" })).toBeVisible();
  });

  it("shows randomization failures with a retry", async () => {
    const api = buildApi();
    vi.mocked(api.rollDice).mockRejectedValueOnce(new Error("boom"));
    const { user } = renderRunner(api);

    await user.click(await screen.findByRole("button", { name: "Skip" }));
    await user.click(await screen.findByRole("button", { name: "Vanilla" }));
    await user.click(await screen.findByRole("button", { name: "South" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(await screen.findByText("boom")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reroll" }));
    expect(await screen.findByText("Governor")).toBeInTheDocument();
  });
});
