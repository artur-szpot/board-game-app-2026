import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SetResponseDto } from "../../dto/collection-items.dto";
import { SetEditorScreen } from "./SetEditorScreen";

vi.mock("axios");
const request = vi.mocked(axios);
const dispatch = vi.fn();
vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: () => "test-token",
}));
const existing: SetResponseDto = {
  id: "set-1",
  name: "people",
  ownerId: "user-1",
  private: true,
  createdOn: "2026-01-01",
  updatedOn: "2026-01-01",
  data: {
    properties: ["city"],
    items: [{ name: "alice", properties: { city: "Paris" } }],
  },
};
const change = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByRole("textbox", { name: label }), {
    target: { value },
  });
const confirm = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await act(() => Promise.resolve());
};

describe("SetEditorScreen", () => {
  beforeEach(() => {
    request.mockReset();
    dispatch.mockReset();
    request.mockResolvedValue({});
  });
  it("shows a read-only form with no mutation or save controls", () => {
    render(<SetEditorScreen frameId="frame-1" set={existing} readOnly />);
    expect(
      screen.getByRole("heading", { name: "View people" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /Data set name/ }),
    ).toHaveAttribute("readonly");
    expect(
      screen.getByRole("textbox", { name: /Item 1 name/ }),
    ).toHaveAttribute("readonly");
    expect(screen.getByRole("textbox", { name: "Item 1 city" })).toHaveValue(
      "Paris",
    );
    expect(
      screen.getByRole("textbox", { name: "Item 1 city" }),
    ).toHaveAttribute("readonly");
    expect(
      screen.queryByRole("button", { name: "Confirm" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remove/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add item" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Property 2" }),
    ).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it("renders one initial property, appends on typing, and highlights cleared intermediate rows", () => {
    render(<SetEditorScreen frameId="frame-1" />);
    expect(screen.getAllByRole("textbox", { name: /^Property/ })).toHaveLength(
      1,
    );
    change("Property 1", "city");
    expect(screen.getAllByRole("textbox", { name: /^Property/ })).toHaveLength(
      2,
    );
    change("Property 1", "");
    expect(screen.getByRole("textbox", { name: "Property 1" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getAllByRole("textbox", { name: /^Property/ })).toHaveLength(
      2,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove property 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove property 1" }));
    expect(screen.getByRole("textbox", { name: "Property 1" })).toHaveValue("");
  });

  it("POSTs exact data without draft IDs or the trailing placeholder", async () => {
    render(<SetEditorScreen frameId="frame-1" />);
    change(/Data set name/, "people");
    change("Property 1", "city");
    change(/Item 1 name/, "alice");
    change("Item 1 city", "Paris ! 123");
    await confirm();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        data: {
          name: "people",
          data: {
            properties: ["city"],
            items: [{ name: "alice", properties: { city: "Paris ! 123" } }],
          },
        },
        headers: { Authorization: "Bearer test-token" },
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { id: "frame-1" } }),
    );
  });

  it("PUTs edits, retaining renamed values and discarding removed ones", async () => {
    render(<SetEditorScreen frameId="frame-1" set={existing} />);
    change("Property 1", "homeTown");
    expect(
      screen.getByRole("textbox", { name: "Item 1 homeTown" }),
    ).toHaveValue("Paris");
    fireEvent.click(screen.getByRole("button", { name: "Remove property 1" }));
    expect(
      screen.queryByRole("textbox", { name: "Item 1 homeTown" }),
    ).not.toBeInTheDocument();
    change("Property 1", "homeTown");
    expect(
      screen.getByRole("textbox", { name: "Item 1 homeTown" }),
    ).toHaveValue("");
    await confirm();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: expect.stringContaining("/game-api/sets/set-1") as string,
        data: {
          name: "people",
          data: {
            properties: ["homeTown"],
            items: [{ name: "alice", properties: { homeTown: "" } }],
          },
        },
      }),
    );
  });

  it("adds and removes item rows, and blocks duplicate names", async () => {
    render(<SetEditorScreen frameId="frame-1" set={existing} />);
    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(screen.getByRole("textbox", { name: "Item 2 city" })).toHaveValue(
      "",
    );
    change(/Item 2 name/, "alice");
    await confirm();
    expect(request).not.toHaveBeenCalled();
    expect(
      screen.getByText("Item names must be unique and camelCase"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove item 2" }));
    await confirm();
    expect(request).toHaveBeenCalledOnce();
  });

  it("blocks saving without a property or with invalid set/item names", async () => {
    render(<SetEditorScreen frameId="frame-1" />);
    change(/Data set name/, "People");
    change(/Item 1 name/, "Alice");
    await confirm();
    expect(request).not.toHaveBeenCalled();
    expect(
      screen.getByText("Data set name must be camelCase"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("At least one property must be set"),
    ).toHaveLength(2);
  });

  it("shows API errors and does not close on failure", async () => {
    request.mockRejectedValueOnce(new Error("Set name is already in use"));
    render(<SetEditorScreen frameId="frame-1" set={existing} />);
    await confirm();
    expect(
      await screen.findByText("Set name is already in use"),
    ).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("requires explicit replacement of legacy data", () => {
    const legacy = { ...existing, data: { properties: [], items: [] } };
    render(<SetEditorScreen frameId="frame-1" set={legacy} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByText(/unsupported data format/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Replace data" }));
    expect(screen.getByRole("textbox", { name: /Item 1 name/ })).toHaveValue(
      "",
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });
});
