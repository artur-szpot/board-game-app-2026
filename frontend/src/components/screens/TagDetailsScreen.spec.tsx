import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TagDetailsScreen } from "./TagDetailsScreen";

vi.mock("axios");

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

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

const defaultState: MockState = {
  currentUser: {
    accessToken: "test-token",
    id: "user-1",
    permissions: [
      {
        permissionType: "SYSTEM_COLLECTION",
        permissionLevel: "FULL",
      },
    ],
  },
};

let mockState: MockState = defaultState;

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: MockState) => unknown) =>
    selector(mockState),
}));

describe("TagDetailsScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    mockState = {
      currentUser: {
        accessToken: "test-token",
        id: "user-1",
        permissions: [
          {
            permissionType: "SYSTEM_COLLECTION",
            permissionLevel: "FULL",
          },
        ],
      },
    };
  });

  it("shows Make public for non-SYSTEM tags when user has SYSTEM_COLLECTION FULL", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: {
        id: "tag-1",
        ownerId: "user-1",
        private: true,
        name: "Strategy",
        description: "Thinky games",
        createdOn: "2026-01-01",
        updatedOn: "2026-01-01",
      },
    } as never);

    render(
      <TagDetailsScreen
        tagId="tag-1"
        openedAsFrame={false}
        frameId="frame-1"
      />,
    );

    await screen.findByRole("heading", { name: "Strategy" });

    expect(
      screen.getByRole("button", { name: "Make public" }),
    ).toBeInTheDocument();
  });

  it("hides Make public for SYSTEM-owned tags", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: {
        id: "tag-1",
        ownerId: "SYSTEM",
        private: false,
        name: "Shared",
        description: "Shared tag",
        createdOn: "2026-01-01",
        updatedOn: "2026-01-01",
      },
    } as never);

    render(
      <TagDetailsScreen
        tagId="tag-1"
        openedAsFrame={false}
        frameId="frame-1"
      />,
    );

    await screen.findByRole("heading", { name: "Shared" });

    expect(
      screen.queryByRole("button", { name: "Make public" }),
    ).not.toBeInTheDocument();
  });

  it("confirms make public, calls PATCH, refreshes details, and hides button after SYSTEM transfer", async () => {
    const user = userEvent.setup();
    const getSpy = vi.spyOn(axios, "get");
    const patchSpy = vi.spyOn(axios, "patch");

    getSpy
      .mockResolvedValueOnce({
        data: {
          id: "tag-1",
          ownerId: "user-1",
          private: true,
          name: "Strategy",
          description: "Thinky games",
          createdOn: "2026-01-01",
          updatedOn: "2026-01-01",
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          id: "tag-1",
          ownerId: "SYSTEM",
          private: false,
          name: "Strategy",
          description: "Thinky games",
          createdOn: "2026-01-01",
          updatedOn: "2026-01-02",
        },
      } as never);

    patchSpy.mockResolvedValueOnce({} as never);

    render(
      <TagDetailsScreen
        tagId="tag-1"
        openedAsFrame={false}
        frameId="frame-1"
      />,
    );

    await screen.findByRole("heading", { name: "Strategy" });

    await user.click(screen.getByRole("button", { name: "Make public" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Make public" }),
    );

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL as string}/game-api/tags/tag-1/system`,
        {},
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Make public" }),
      ).not.toBeInTheDocument();
    });
  });
});
