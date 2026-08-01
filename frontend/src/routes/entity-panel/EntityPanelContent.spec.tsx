import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GameDataType } from "../../components/screens/selection-strategies";
import { EntityPanelContent } from "./EntityPanelContent";

describe("EntityPanelContent", () => {
  it("opens the configured view action when the item name is clicked", async () => {
    const user = userEvent.setup();
    const onViewItem = vi.fn();

    render(
      <EntityPanelContent
        tab={{ category: GameDataType.GAME, label: "Games" }}
        items={[
          {
            id: "game-1",
            name: "Brass",
            description: "Industrial strategy",
            length: "LONG",
            minPlayers: 2,
            maxPlayers: 4,
            tags: [],
          },
        ]}
        loading={false}
        onViewItem={onViewItem}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Brass" }));

    expect(onViewItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: "game-1", name: "Brass" }),
    );
  });

  it("renders a plain heading when no view action is configured", () => {
    render(
      <EntityPanelContent
        tab={{ category: GameDataType.TAG, label: "Tags" }}
        items={[
          {
            id: "tag-1",
            name: "Strategy",
            description: "Thinky games",
          },
        ]}
        loading={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Strategy" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Strategy" }),
    ).toBeInTheDocument();
  });

  it("renders location path under description for location items", () => {
    render(
      <EntityPanelContent
        tab={{ category: GameDataType.LOCATION, label: "Locations" }}
        items={[
          {
            id: "location-1",
            name: "Shelf B2",
            description: "Second room shelf",
            path: [
              { id: "room-1", name: "Room" },
              { id: "shelf-b", name: "Shelf B" },
              { id: "slot-2", name: "Shelf B2" },
            ],
          },
        ]}
        loading={false}
      />,
    );

    expect(screen.getByText("Second room shelf")).toBeInTheDocument();
    expect(screen.getByText("Room » Shelf B")).toBeInTheDocument();
  });

  it("does not render location path when path only contains the current location", () => {
    render(
      <EntityPanelContent
        tab={{ category: GameDataType.LOCATION, label: "Locations" }}
        items={[
          {
            id: "location-2",
            name: "Top Shelf",
            description: "Single location path",
            path: [{ id: "location-2", name: "Top Shelf" }],
          },
        ]}
        loading={false}
      />,
    );

    expect(screen.getByText("Single location path")).toBeInTheDocument();
    expect(screen.getAllByText("Top Shelf")).toHaveLength(1);
  });
});
