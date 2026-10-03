import { act, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { buildTestHelperLogic } from "./components/helper-runner/test-helper-logic";
import { GameDataType } from "./components/screens/selection-strategies";
import { PermissionLevel, PermissionType } from "./dto/user-data.dto";
import { renderWithProviders } from "./utils/test-utils";

vi.mock("axios");
vi.mock("./components/bars/Navbar", () => ({ Navbar: () => null }));
vi.mock("./components/bars/Footer", () => ({ Footer: () => null }));

const post = vi.spyOn(axios, "post");
const get = vi.spyOn(axios, "get");

const cases = [
  {
    segment: "helpers",
    category: GameDataType.HELPER,
    item: {
      id: "helper-1",
      ownerId: "user-1",
      name: "Setup",
      logic: buildTestHelperLogic(),
    },
    createTitle: "Add a new helper",
  },
  {
    segment: "sets",
    category: GameDataType.SET,
    item: {
      id: "set-1",
      ownerId: "user-1",
      name: "people",
      data: {
        properties: ["city"],
        items: [{ name: "alice", properties: { city: "Paris" } }],
      },
    },
    createTitle: "New helper data set",
  },
] as const;

const renderApp = (path: string) => {
  window.history.replaceState(null, "", "/previous");
  window.history.pushState(null, "", path);
  return renderWithProviders(
    <StrictMode>
      <App />
    </StrictMode>,
    {
      preloadedState: {
        currentUser: {
          id: "user-1",
          accessToken: "test-token",
          permissions: [
            {
              permissionType: PermissionType.DATA_MANAGEMENT,
              permissionLevel: PermissionLevel.FULL,
            },
          ],
        },
      },
    },
  );
};

const goBack = async () => {
  await act(async () => {
    window.history.back();
    await Promise.resolve();
  });
};

const goForward = async () => {
  await act(async () => {
    window.history.forward();
    await Promise.resolve();
  });
};

describe("helper and set form navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios).mockResolvedValue({ data: {} });
    post.mockImplementation((_url, body: unknown) => {
      if (typeof body !== "object" || body === null || !("types" in body)) {
        throw new Error("Invalid search request");
      }
      const types: unknown = body.types;
      if (!Array.isArray(types)) {
        throw new Error("Invalid search types");
      }
      const entry = cases.find(entry => types.includes(entry.category));
      return Promise.resolve({
        data: {
          total: 30,
          results: [{ detail: entry?.item }],
        },
      });
    });
    get.mockImplementation(url => {
      const entry = cases.find(entry => url.includes(`/${entry.segment}/`));
      if (!entry) {
        throw new Error(`Unexpected GET URL: ${url}`);
      }
      return Promise.resolve({ data: entry.item });
    });
  });

  it.each(cases)(
    "opens Add for $segment and cancels on the first click without duplicate history",
    async ({ segment, createTitle }) => {
      const listPath = `/collection/${segment}?page=2&pageSize=10`;
      const { user, store } = renderApp(listPath);
      await screen.findByRole("button", { name: "Add" });
      await user.click(screen.getByRole("button", { name: "Add" }));
      expect(
        await screen.findByRole("heading", { name: createTitle }),
      ).toBeInTheDocument();
      expect(window.location.pathname).toBe(`/collection/${segment}/new`);
      expect(store.getState().frameStack.stack).toHaveLength(2);

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(window.location.pathname + window.location.search).toBe(
          listPath,
        ),
      );
      expect(
        screen.queryByRole("heading", { name: createTitle }),
      ).not.toBeInTheDocument();
      expect(store.getState().frameStack.stack).toHaveLength(1);

      await goBack();
      await waitFor(() => expect(window.location.pathname).toBe("/previous"));
      await goForward();
      await waitFor(() =>
        expect(window.location.pathname + window.location.search).toBe(
          listPath,
        ),
      );
      await goForward();
      expect(
        await screen.findByRole("heading", { name: createTitle }),
      ).toBeInTheDocument();
      expect(store.getState().frameStack.stack).toHaveLength(2);
    },
  );

  it.each(cases)(
    "cancels $segment definition on the first click and supports Back/Forward",
    async ({ segment, item }) => {
      const listPath = `/collection/${segment}?page=2&pageSize=10`;
      const definitionPath = `/collection/${segment}/${item.id}/definition`;
      const { user, store } = renderApp(listPath);
      await user.click(
        await screen.findByRole("button", { name: "Edit item" }),
      );
      expect(
        await screen.findByRole("heading", { name: `Edit ${item.name}` }),
      ).toBeInTheDocument();
      expect(window.location.pathname).toBe(definitionPath);
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(window.location.pathname + window.location.search).toBe(
          listPath,
        ),
      );
      expect(store.getState().frameStack.stack).toHaveLength(1);

      await goForward();
      await screen.findByRole("heading", { name: `Edit ${item.name}` });
      await goBack();
      await waitFor(() =>
        expect(window.location.pathname + window.location.search).toBe(
          listPath,
        ),
      );
      expect(
        screen.queryByRole("heading", { name: `Edit ${item.name}` }),
      ).not.toBeInTheDocument();
      await goForward();
      await screen.findByRole("heading", { name: `Edit ${item.name}` });
      expect(store.getState().frameStack.stack).toHaveLength(2);
    },
  );

  it.each(cases)(
    "opens $segment directly and cancels to its list",
    async ({ segment, item }) => {
      const { user, store } = renderApp(
        `/collection/${segment}/${item.id}/definition`,
      );
      await screen.findByRole("heading", { name: `Edit ${item.name}` });
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(window.location.pathname).toBe(`/collection/${segment}`),
      );
      expect(store.getState().frameStack.stack).toHaveLength(1);
    },
  );

  it.each(cases)(
    "opens $segment Add directly and cancels to its list",
    async ({ segment, createTitle }) => {
      const { user, store } = renderApp(`/collection/${segment}/new`);
      await screen.findByRole("heading", { name: createTitle });
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(window.location.pathname).toBe(`/collection/${segment}`),
      );
      expect(store.getState().frameStack.stack).toHaveLength(1);
    },
  );

  it.each(cases)(
    "does not reopen $segment after leaving while the definition is loading",
    async ({ segment, item }) => {
      const pendingResponses: (() => void)[] = [];
      get.mockImplementation(
        () =>
          new Promise(resolve => {
            pendingResponses.push(() => resolve({ data: item }));
          }),
      );
      const { user, store } = renderApp(`/collection/${segment}`);
      await user.click(
        await screen.findByRole("button", { name: "Edit item" }),
      );
      await waitFor(() => expect(pendingResponses.length).toBeGreaterThan(0));
      await goBack();
      await waitFor(() =>
        expect(window.location.pathname).toBe(`/collection/${segment}`),
      );
      await act(async () => {
        pendingResponses.forEach(resolve => resolve());
        await Promise.resolve();
      });
      expect(store.getState().frameStack.stack).toHaveLength(1);
      expect(
        screen.queryByRole("heading", { name: `Edit ${item.name}` }),
      ).not.toBeInTheDocument();
    },
  );

  it.each(cases)(
    "shows $segment definition loading errors without resetting them with a list fetch",
    async ({ segment, item }) => {
      get.mockRejectedValue(new Error("Unable to load definition"));
      renderApp(`/collection/${segment}/${item.id}/definition`);
      expect(
        await screen.findByText("Unable to load definition"),
      ).toBeInTheDocument();
      expect(post).not.toHaveBeenCalled();
    },
  );

  it.each(cases)(
    "saves $segment definition and returns to the previous list",
    async ({ segment, item }) => {
      const listPath = `/collection/${segment}?page=2&pageSize=10`;
      const { user } = renderApp(listPath);
      await user.click(
        await screen.findByRole("button", { name: "Edit item" }),
      );
      await screen.findByRole("heading", { name: `Edit ${item.name}` });
      await user.click(screen.getByRole("button", { name: "Confirm" }));
      await waitFor(() =>
        expect(window.location.pathname + window.location.search).toBe(
          listPath,
        ),
      );
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: "PUT" }),
      );
    },
  );
});
