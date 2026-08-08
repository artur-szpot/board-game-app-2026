import { describe, expect, it } from "vitest";

import type {
    GameResponseDto,
    LocationResponseDto,
    TagResponseDto,
} from "../../../dto/collection-items.dto";
import { GameDataType } from "../selection-strategies";
import { buildEditGameScreen } from "./edit-game";
import { buildEditLocationScreen } from "./edit-location";
import { buildEditTagScreen } from "./edit-tag";

describe("edit form definitions", () => {
  it("preloads game selections from the current entity", () => {
    const screen = buildEditGameScreen({
      id: "game-1",
      ownerId: "user-1",
      private: true,
      name: "Terraforming Mars",
      description: "Terraforming game",
      length: "long" as never,
      minPlayers: 1,
      maxPlayers: 5,
      tags: [{ id: "tag-1", name: "Strategy", description: "Tag" }],
      locations: [
        {
          locationId: "location-1",
          note: "top shelf",
          isGameId: false,
          path: [{ name: "Shelf", id: "location-1" }],
        },
      ],
      scoringSchemaIds: ["schema-1"],
      scoringSchemas: [
        {
          id: "schema-1",
          ownerId: "user-1",
          private: true,
          name: "Default scoring",
          schema: {},
          createdOn: "2026-01-01T00:00:00.000Z",
          updatedOn: "2026-01-02T00:00:00.000Z",
        },
      ],
      helperIds: ["helper-1"],
      helpers: [
        {
          id: "helper-1",
          ownerId: "user-1",
          private: true,
          name: "Round helper",
          logic: {},
          createdOn: "2026-01-01T00:00:00.000Z",
          updatedOn: "2026-01-02T00:00:00.000Z",
        },
      ],
      createdOn: "2026-01-01T00:00:00.000Z",
      updatedOn: "2026-01-02T00:00:00.000Z",
    } satisfies GameResponseDto);

    const tagField = screen.fields.find(field => field.name === "tagIds");
    const locationField = screen.fields.find(
      field => field.name === "locations",
    );
    const schemaField = screen.fields.find(
      field => field.name === "scoringSchemaIds",
    );
    const helperField = screen.fields.find(field => field.name === "helperIds");

    expect(screen.method).toBe("PATCH");
    expect(screen.action).toBe("game-api/games/game-1");
    expect(tagField?.kind).toBeDefined();
    expect(locationField?.kind).toBeDefined();
    expect(schemaField?.kind).toBeDefined();
    expect(helperField?.kind).toBeDefined();
    expect(
      (tagField as { params?: { currentSelection?: unknown[] } }).params
        ?.currentSelection,
    ).toHaveLength(1);
    expect(
      (locationField as { params?: { currentSelection?: unknown[] } }).params
        ?.currentSelection,
    ).toEqual([
      expect.objectContaining({
        type: GameDataType.LOCATION,
        value: "location-1",
        name: "Shelf",
      }),
    ]);
  });

  it("preloads tag and location parent selections", () => {
    const tagScreen = buildEditTagScreen({
      id: "tag-1",
      ownerId: "user-1",
      private: true,
      name: "Strategy",
      description: "",
      parentId: "tag-9",
      createdOn: "2026-01-01T00:00:00.000Z",
      updatedOn: "2026-01-02T00:00:00.000Z",
    } satisfies TagResponseDto);
    const locationScreen = buildEditLocationScreen({
      id: "location-1",
      ownerId: "user-1",
      private: true,
      name: "Shelf",
      description: "",
      parentId: "location-9",
      path: [
        { name: "Warehouse", id: "location-9" },
        { name: "Shelf", id: "location-1" },
      ],
      createdOn: "2026-01-01T00:00:00.000Z",
      updatedOn: "2026-01-02T00:00:00.000Z",
    } satisfies LocationResponseDto);

    const tagParentField = tagScreen.fields.find(
      field => field.name === "parentId",
    );
    const locationParentField = locationScreen.fields.find(
      field => field.name === "parentId",
    );

    expect(tagScreen.method).toBe("PATCH");
    expect(tagScreen.action).toBe("game-api/tags/tag-1");
    expect(locationScreen.method).toBe("PATCH");
    expect(locationScreen.action).toBe("game-api/locations/location-1");
    expect(
      (tagParentField as { params?: { currentSelection?: unknown[] } }).params
        ?.currentSelection,
    ).toEqual([
      expect.objectContaining({
        type: GameDataType.TAG,
        value: "tag-9",
        name: "tag-9",
      }),
    ]);
    expect(
      (locationParentField as { params?: { currentSelection?: unknown[] } })
        .params?.currentSelection,
    ).toEqual([
      expect.objectContaining({
        type: GameDataType.LOCATION,
        value: "location-9",
        name: "Warehouse",
      }),
    ]);
  });
});
