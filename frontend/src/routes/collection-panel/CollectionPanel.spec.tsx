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
  it("uses dedicated helper data set create/edit frames", () => {
    render(<CollectionPanel />);
    const props = entityPanelSpy.mock.calls.at(-1)?.[0] as {
      tabs: {
        category: GameDataType;
        label: string;
        createAction?: () => { type: string };
        editScreen?: (item: object) => { type: string };
      }[];
    };
    const tab = props.tabs.find(tab => tab.category === GameDataType.SET);
    expect(tab?.label).toBe("Helper data sets");
    expect(tab?.createAction?.().type).toBe("frameStack/openSetEditorFrame");
    expect(
      tab?.editScreen?.({
        id: "set-1",
        name: "people",
        data: { properties: [], items: [] },
      }).type,
    ).toBe("frameStack/openSetEditorFrame");
  });
  it("provides view routes for games, tags and locations", () => {
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
        viewPath?: (item: { id: string }) => string;
      }[];
    };

    const gameTab = props.tabs.find(tab => tab.category === GameDataType.GAME);
    const tagTab = props.tabs.find(tab => tab.category === GameDataType.TAG);
    const locationTab = props.tabs.find(
      tab => tab.category === GameDataType.LOCATION,
    );

    expect(gameTab?.viewPath?.({ id: "game-1" })).toBe(
      "/collection/games/game-1",
    );
    expect(tagTab?.viewPath?.({ id: "tag-1" })).toBe("/collection/tags/tag-1");
    expect(locationTab?.viewPath?.({ id: "location-1" })).toBe(
      "/collection/locations/location-1",
    );
  });

  it("configures filters on the games tab only", () => {
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
        filters?: { key: string }[];
      }[];
    };

    const gameTab = props.tabs.find(tab => tab.category === GameDataType.GAME);
    const otherTabs = props.tabs.filter(
      tab => tab.category !== GameDataType.GAME,
    );

    expect(gameTab?.filters?.map(filter => filter.key)).toEqual([
      "playerCount",
      "tagIds",
      "locationIds",
      "hasHelpers",
      "length",
    ]);
    expect(otherTabs.every(tab => tab.filters === undefined)).toBe(true);
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
