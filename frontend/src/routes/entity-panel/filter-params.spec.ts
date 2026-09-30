import { describe, expect, it } from "vitest";

import { GameDataType } from "../../components/screens/selection-strategies";

import type { EntityPanelFilterDefinition } from "./entity-panel-types";
import { EntityPanelFilterKind } from "./entity-panel-types";
import {
    buildFilterSearch,
    clearFilterSearch,
    parseFilterParams,
} from "./filter-params";

const DEFINITIONS: EntityPanelFilterDefinition[] = [
  { kind: EntityPanelFilterKind.NUMBER, key: "playerCount", label: "Players" },
  {
    kind: EntityPanelFilterKind.SELECT,
    key: "length",
    label: "Game length",
    options: [{ value: "SHORT", label: "SHORT" }],
  },
  {
    kind: EntityPanelFilterKind.TRI_STATE,
    key: "hasHelpers",
    label: "Helpers",
    trueLabel: "With",
    falseLabel: "Without",
  },
  {
    kind: EntityPanelFilterKind.ENTITY_SELECTION,
    key: "tagIds",
    label: "Tags",
    dataTypes: [GameDataType.TAG],
    detailEndpoint: "game-api/tags",
  },
];

describe("filter params", () => {
  it("parses only known and valid parameters", () => {
    const values = parseFilterParams(
      new URLSearchParams(
        "f_playerCount=4&f_length=EPIC&f_hasHelpers=true&f_tagIds=tag-1,,%20tag-2%20,tag-1&f_unknown=x&page=2",
      ),
      DEFINITIONS,
    );

    expect(values).toEqual({
      playerCount: "4",
      hasHelpers: "true",
      tagIds: "tag-1,tag-2",
    });
  });

  it("rejects non-positive numbers", () => {
    expect(
      parseFilterParams(new URLSearchParams("f_playerCount=0"), DEFINITIONS),
    ).toEqual({});
  });

  it("round-trips values through the search string", () => {
    const search = buildFilterSearch(
      new URLSearchParams("page=2"),
      { playerCount: "4", length: "SHORT" },
      DEFINITIONS,
    );

    expect(search.toString()).toBe("page=2&f_playerCount=4&f_length=SHORT");
    expect(parseFilterParams(search, DEFINITIONS)).toEqual({
      playerCount: "4",
      length: "SHORT",
    });
  });

  it("removes parameters for empty or invalid patch values", () => {
    const search = buildFilterSearch(
      new URLSearchParams("f_playerCount=4&f_hasHelpers=true"),
      { playerCount: "", hasHelpers: "maybe" },
      DEFINITIONS,
    );

    expect(search.toString()).toBe("");
  });

  it("clears every filter parameter but keeps the rest", () => {
    const search = clearFilterSearch(
      new URLSearchParams("page=2&f_playerCount=4&f_tagIds=tag-1"),
    );

    expect(search.toString()).toBe("page=2");
  });
});
