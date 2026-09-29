import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ScoringSchemaResponseDto } from "../../dto/collection-items.dto";
import { ScoringGroupMechanism } from "../../dto/scoring-schema.dto";
import { ScoreEntryScreen } from "./ScoreEntryScreen";

vi.mock("axios");

const mockDispatch = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => "test-token",
}));

const schema: ScoringSchemaResponseDto = {
  id: "schema-1",
  ownerId: "user-1",
  private: true,
  name: "Standard",
  createdOn: "2026-01-01",
  updatedOn: "2026-01-01",
  schema: {
    version: 1,
    groups: [
      {
        id: "group-1",
        name: "Main",
        mechanism: ScoringGroupMechanism.SUM_ALL,
        categories: [
          {
            id: "category-1",
            name: "Resources",
            rows: [
              { id: "row-coins", name: "Coins" },
              { id: "row-wood", name: "Wood" },
            ],
          },
        ],
      },
      {
        id: "group-2",
        name: "Products",
        mechanism: ScoringGroupMechanism.GREATEST_ONLY,
        categories: [
          {
            id: "category-2",
            name: "Stone",
            rows: [{ id: "row-stone", name: "Stone" }],
          },
          {
            id: "category-3",
            name: "Ore",
            rows: [{ id: "row-ore", name: "Ore" }],
          },
        ],
      },
    ],
  },
};

const renderScreen = () =>
  render(
    <ScoreEntryScreen
      frameId="frame-1"
      gameId="game-1"
      gameName="Brass"
      schema={schema}
    />,
  );

const enterScore = (rowName: string, player: string, value: string) => {
  fireEvent.change(
    screen.getByRole("spinbutton", { name: `${rowName} for ${player}` }),
    { target: { value } },
  );
};

const confirm = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await act(() => Promise.resolve());
};

describe("ScoreEntryScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockDispatch.mockReset();
  });

  it("recomputes group and grand totals as values are entered", () => {
    renderScreen();

    enterScore("Coins", "D", "3");
    enterScore("Wood", "D", "4");
    enterScore("Stone", "D", "2");
    enterScore("Ore", "D", "9");

    // SUM_ALL over one category of 3 + 4, then GREATEST_ONLY of 2 and 9.
    expect(screen.getByText("Resources subtotal")).toBeInTheDocument();
    expect(
      screen.getByRole("row", { name: /Main \(Sum all\)/ }),
    ).toHaveTextContent("7");
    expect(
      screen.getByRole("row", { name: /Products \(Greatest only\)/ }),
    ).toHaveTextContent("9");
    expect(screen.getByRole("row", { name: /^Total/ })).toHaveTextContent("16");
  });

  it("posts raw values and the player roster without computed totals", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({} as never);
    renderScreen();

    enterScore("Coins", "D", "3");
    enterScore("Ore", "B", "5");

    await confirm();
    expect(post).toHaveBeenCalled();

    const [, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    expect(body).toMatchObject({
      gameId: "game-1",
      schemaId: "schema-1",
      scores: {
        players: ["D", "B", "A", "M", "R", "E"],
        values: { "row-coins": { D: 3 }, "row-ore": { B: 5 } },
      },
    });
  });

  it("clears a value when the input is emptied", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({} as never);
    renderScreen();

    enterScore("Coins", "D", "3");
    enterScore("Coins", "D", "");

    await confirm();
    expect(post).toHaveBeenCalled();

    const [, body] = post.mock.calls[0] as [
      string,
      { scores: { values: Record<string, Record<string, number>> } },
    ];
    expect(body.scores.values["row-coins"]).toEqual({});
  });
});
