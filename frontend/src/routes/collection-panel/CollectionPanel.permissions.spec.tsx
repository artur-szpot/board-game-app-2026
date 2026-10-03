import { screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameDataType } from "../../components/screens/selection-strategies";
import { buildTestHelperLogic } from "../../components/helper-runner/test-helper-logic";
import { PermissionLevel, PermissionType } from "../../dto/user-data.dto";
import { renderWithProviders } from "../../utils/test-utils";
import { CollectionPanel } from "./CollectionPanel";

vi.mock("axios");
const post = vi.spyOn(axios, "post");
const get = vi.spyOn(axios, "get");
const items = {
  [GameDataType.SET]: {
    id: "set-1",
    ownerId: "user-1",
    name: "people",
    data: {
      properties: ["city"],
      items: [{ name: "alice", properties: { city: "Paris" } }],
    },
  },
  [GameDataType.HELPER]: {
    id: "helper-1",
    ownerId: "user-1",
    name: "Setup",
    logic: buildTestHelperLogic(),
  },
};
const renderPanel = (
  content: GameDataType.HELPER | GameDataType.SET,
  level?: PermissionLevel,
  owner = "user-1",
) => {
  post.mockResolvedValue({
    data: {
      total: 1,
      results: [{ detail: { ...items[content], ownerId: owner } }],
    },
  });
  get.mockImplementation(url => {
    if (typeof url !== "string") {
      throw new Error("Invalid request URL");
    }
    if (url.includes("/game-api/helpers/")) {
      return Promise.resolve({
        data: { ...items[GameDataType.HELPER], ownerId: owner },
      });
    }
    if (url.includes("/game-api/sets/")) {
      return Promise.resolve({
        data: { ...items[GameDataType.SET], ownerId: owner },
      });
    }
    throw new Error(`Unexpected GET URL: ${url}`);
  });
  return renderWithProviders(
    <MemoryRouter>
      <CollectionPanel content={content} />
    </MemoryRouter>,
    {
      preloadedState: {
        currentUser: {
          id: "user-1",
          accessToken: "test-token",
          permissions: level
            ? [
                {
                  permissionType: PermissionType.DATA_MANAGEMENT,
                  permissionLevel: level,
                },
              ]
            : [],
        },
      },
    },
  );
};

describe("collection data permissions", () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });
  it.each([GameDataType.HELPER, GameDataType.SET] as const)(
    "hides %s tabs and rejects direct access without permission",
    async content => {
      renderPanel(content);
      expect(
        screen.queryByRole("tab", { name: "Helpers" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("tab", { name: "Helper data sets" }),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText("You do not have permission to view this tab."),
      ).toBeInTheDocument();
      expect(post).not.toHaveBeenCalled();
    },
  );
  it.each([
    [GameDataType.HELPER, 0],
    [GameDataType.SET, 1],
  ] as const)(
    "READ allows viewing %s but no writes, even for owned items",
    async (content, editCount) => {
      const { user } = renderPanel(content, PermissionLevel.READ);
      expect(await screen.findByText(items[content].name)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
      const editButtons = screen.queryAllByRole("button", {
        name: "Edit item",
      });
      expect(editButtons).toHaveLength(editCount);
      expect(editButtons.every(button => button.hasAttribute("disabled"))).toBe(
        true,
      );
      expect(screen.getByTestId("VisibilityIcon")).toBeInTheDocument();
      expect(screen.queryAllByTestId("EditIcon")).toHaveLength(editCount);
      expect(
        screen.getByRole("button", { name: "Delete item" }),
      ).toBeDisabled();
      await user.click(screen.getByRole("button", { name: "View item" }));
      expect(
        await screen.findByRole("heading", {
          name: `View ${items[content].name}`,
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Confirm" }),
      ).not.toBeInTheDocument();
      expect(
        screen
          .getAllByRole("textbox")
          .every(input => input.hasAttribute("readonly")),
      ).toBe(true);
    },
  );
  it.each([
    [GameDataType.HELPER, 0],
    [GameDataType.SET, 1],
  ] as const)("FULL allows editing owned %s", async (content, viewCount) => {
    const { user } = renderPanel(content, PermissionLevel.FULL);
    expect(await screen.findByText(items[content].name)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete item" })).toBeEnabled();
    expect(screen.queryAllByRole("button", { name: "View item" })).toHaveLength(
      viewCount,
    );
    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
    expect(screen.queryAllByTestId("VisibilityIcon")).toHaveLength(viewCount);
    await user.click(screen.getByRole("button", { name: "Edit item" }));
    expect(
      await screen.findByRole("heading", {
        name: `Edit ${items[content].name}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });
  it.each([
    [GameDataType.HELPER, 0],
    [GameDataType.SET, 1],
  ] as const)(
    "FULL does not bypass %s ownership",
    async (content, editCount) => {
      const { user } = renderPanel(
        content,
        PermissionLevel.FULL,
        "another-user",
      );
      expect(await screen.findByText(items[content].name)).toBeInTheDocument();
      const editButtons = screen.queryAllByRole("button", {
        name: "Edit item",
      });
      expect(editButtons).toHaveLength(editCount);
      expect(editButtons.every(button => button.hasAttribute("disabled"))).toBe(
        true,
      );
      expect(
        screen.getByRole("button", { name: "Delete item" }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "View item" })).toBeEnabled();
      await user.click(screen.getByRole("button", { name: "View item" }));
      expect(
        screen.queryByRole("button", { name: "Confirm" }),
      ).not.toBeInTheDocument();
    },
  );
});
