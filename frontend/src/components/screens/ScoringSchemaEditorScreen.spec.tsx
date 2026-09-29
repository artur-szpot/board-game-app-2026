import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ScoringSchemaResponseDto } from "../../dto/collection-items.dto";
import { ScoringGroupMechanism } from "../../dto/scoring-schema.dto";
import { ScoringSchemaEditorScreen } from "./ScoringSchemaEditorScreen";

vi.mock("axios");

const request = vi.mocked(axios);
const mockDispatch = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => "test-token",
}));

const existing: ScoringSchemaResponseDto = {
  id: "schema-1",
  ownerId: "user-1",
  private: true,
  name: "Standard",
  description: "Base scoring",
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
            rows: [{ id: "row-1", name: "Coins" }],
          },
        ],
      },
    ],
  },
};

const confirm = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await act(() => Promise.resolve());
};

const rowNameFields = () =>
  screen.getAllByRole("textbox", { name: /Row name/ });

describe("ScoringSchemaEditorScreen", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    request.mockReset();
    request.mockResolvedValue({} as never);
  });

  it("refuses to save while a row has neither a name nor an icon", async () => {
    render(<ScoringSchemaEditorScreen frameId="frame-1" />);

    fireEvent.change(screen.getByRole("textbox", { name: /Schema name/ }), {
      target: { value: "Fresh" },
    });

    await confirm();

    expect(
      screen.getByText("Every row needs a name or an icon"),
    ).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it("PATCHes an existing schema with blank optional names stripped", async () => {
    render(<ScoringSchemaEditorScreen frameId="frame-1" schema={existing} />);

    fireEvent.change(screen.getByRole("textbox", { name: /Group name/ }), {
      target: { value: "  " },
    });

    await confirm();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        url: expect.stringContaining(
          "/game-api/scoring-schemas/schema-1",
        ) as string,
        data: expect.objectContaining({
          name: "Standard",
          schema: {
            version: 1,
            groups: [
              {
                id: "group-1",
                mechanism: ScoringGroupMechanism.SUM_ALL,
                categories: [
                  {
                    id: "category-1",
                    name: "Resources",
                    rows: [{ id: "row-1", name: "Coins" }],
                  },
                ],
              },
            ],
          },
        }) as object,
      }),
    );
  });

  it("POSTs a brand new schema", async () => {
    render(<ScoringSchemaEditorScreen frameId="frame-1" />);

    fireEvent.change(screen.getByRole("textbox", { name: /Schema name/ }), {
      target: { value: "Fresh" },
    });
    fireEvent.change(rowNameFields()[0], { target: { value: "Points" } });

    await confirm();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("adds and removes rows within a category", () => {
    render(<ScoringSchemaEditorScreen frameId="frame-1" schema={existing} />);

    expect(rowNameFields()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));
    expect(rowNameFields()).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove row" })[1]);
    expect(rowNameFields()).toHaveLength(1);
  });
});
