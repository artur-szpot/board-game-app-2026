import { describe, expect, it, vi } from "vitest";

const entityPanelSpy = vi.fn();

vi.mock("../entity-panel/EntityPanel", () => ({
  EntityPanel: (props: unknown) => {
    entityPanelSpy(props);
    return <div>Collection panel</div>;
  },
}));

import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { GameDataType } from "../../components/screens/selection-strategies";
import { makeStore } from "../../store/store";
import { CollectionPanel } from "./CollectionPanel";

describe("CollectionPanel", () => {
  it("provides view actions for tags and locations", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionPanel />
        </MemoryRouter>
      </Provider>,
    );

    const props = entityPanelSpy.mock.calls.at(-1)?.[0] as {
      tabs: {
        category: GameDataType;
        viewScreen?: (item: { id: string }) => { type: string };
      }[];
    };

    const tagTab = props.tabs.find(tab => tab.category === GameDataType.TAG);
    const locationTab = props.tabs.find(
      tab => tab.category === GameDataType.LOCATION,
    );

    expect(tagTab?.viewScreen).toBeTypeOf("function");
    expect(locationTab?.viewScreen).toBeTypeOf("function");
    expect(tagTab?.viewScreen?.({ id: "tag-1" }).type).toBe(
      "frameStack/openTagDetailsFrame",
    );
    expect(locationTab?.viewScreen?.({ id: "location-1" }).type).toBe(
      "frameStack/openLocationDetailsFrame",
    );
  });

  it("provides edit actions for games, tags, and locations", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionPanel />
        </MemoryRouter>
      </Provider>,
    );

    const props = entityPanelSpy.mock.calls.at(-1)?.[0] as {
      tabs: {
        category: GameDataType;
        editScreen?: (item: { id: string; name?: string }) => { type: string };
      }[];
    };

    const gameTab = props.tabs.find(tab => tab.category === GameDataType.GAME);
    const tagTab = props.tabs.find(tab => tab.category === GameDataType.TAG);
    const locationTab = props.tabs.find(
      tab => tab.category === GameDataType.LOCATION,
    );

    const gameItem = {
      id: "game-1",
      ownerId: "user-1",
      private: true,
      name: "Game",
      description: "",
      length: "long" as never,
      minPlayers: 2,
      maxPlayers: 4,
      tags: [],
      locations: [],
      scoringSchemaIds: [],
      scoringSchemas: [],
      helperIds: [],
      helpers: [],
      createdOn: "2026-01-01T00:00:00.000Z",
      updatedOn: "2026-01-02T00:00:00.000Z",
    };

    expect(gameTab?.editScreen?.(gameItem).type).toBe(
      "frameStack/openFormFrame",
    );
    expect(tagTab?.editScreen?.({ id: "tag-1", name: "Tag" }).type).toBe(
      "frameStack/openFormFrame",
    );
    expect(
      locationTab?.editScreen?.({ id: "location-1", name: "Location" }).type,
    ).toBe("frameStack/openFormFrame");
  });

  it("should be defined", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionPanel />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText(/collection panel/i)).toBeDefined();
  });
});
