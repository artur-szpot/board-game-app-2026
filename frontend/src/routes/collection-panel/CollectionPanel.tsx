import type React from "react";

import { createGameScreen } from "../../components/screens/definitions/create-game";
import { createLocationScreen } from "../../components/screens/definitions/create-location";
import { createTagScreen } from "../../components/screens/definitions/create-tag";
import { buildEditGameScreen } from "../../components/screens/definitions/edit-game";
import { buildEditLocationScreen } from "../../components/screens/definitions/edit-location";
import { buildEditTagScreen } from "../../components/screens/definitions/edit-tag";
import {
    buildEditHelperScreen,
    buildEditSetScreen,
    createHelperScreen,
    createSetScreen,
} from "../../components/screens/definitions/helpers-and-sets";
import { GameDataType } from "../../components/screens/selection-strategies";
import type {
    GameResponseDto,
    HelperResponseDto,
    LocationResponseDto,
    ScoringSchemaResponseDto,
    SetResponseDto,
    TagResponseDto,
} from "../../dto/collection-items.dto";
import { GameLength } from "../../dto/game-length.enum";
import {
    openFormFrame,
    openScoringSchemaEditorFrame,
} from "../../store/features/frameStackSlice";
import type { EntityPanelTab } from "../entity-panel/entity-panel-types";
import { EntityPanelFilterKind } from "../entity-panel/entity-panel-types";
import { EntityPanel } from "../entity-panel/EntityPanel";
import type {
    CollectionPanelCategory,
    CollectionPanelDetailsByType,
    CollectionPanelItem,
    CollectionPanelProps,
} from "./collection-types";

const GAME_FILTERS = [
  {
    kind: EntityPanelFilterKind.NUMBER as const,
    key: "playerCount",
    label: "Players",
  },
  {
    kind: EntityPanelFilterKind.ENTITY_SELECTION as const,
    key: "tagIds",
    label: "Tags",
    dataTypes: [GameDataType.TAG],
    detailEndpoint: "game-api/tags",
  },
  {
    kind: EntityPanelFilterKind.ENTITY_SELECTION as const,
    key: "locationIds",
    label: "Locations",
    dataTypes: [GameDataType.LOCATION],
    detailEndpoint: "game-api/locations",
  },
  {
    kind: EntityPanelFilterKind.TRI_STATE as const,
    key: "hasHelpers",
    label: "Helpers",
    trueLabel: "With helpers",
    falseLabel: "Without helpers",
  },
  {
    kind: EntityPanelFilterKind.SELECT as const,
    key: "length",
    label: "Game length",
    // TODO: reuse a shared enum-to-words mapper for game length once it exists.
    options: [
      GameLength.FILLER,
      GameLength.SHORT,
      GameLength.MEDIUM,
      GameLength.LONG,
    ].map(length => ({ value: length, label: length })),
  },
];

const COLLECTION_TABS: EntityPanelTab<
  CollectionPanelCategory,
  CollectionPanelItem
>[] = [
  {
    category: GameDataType.GAME,
    routeSegment: "games",
    label: "Games",
    createScreen: createGameScreen,
    editScreen: item =>
      openFormFrame({ params: buildEditGameScreen(item as GameResponseDto) }),
    viewPath: item => `/collection/games/${item.id}`,
    deleteEndpoint: (item: CollectionPanelItem) => `game-api/games/${item.id}`,
    filters: GAME_FILTERS,
  },
  {
    category: GameDataType.TAG,
    routeSegment: "tags",
    label: "Tags",
    createScreen: createTagScreen,
    editScreen: item =>
      openFormFrame({ params: buildEditTagScreen(item as TagResponseDto) }),
    viewPath: item => `/collection/tags/${item.id}`,
    deleteEndpoint: (item: CollectionPanelItem) => `game-api/tags/${item.id}`,
  },
  {
    category: GameDataType.LOCATION,
    routeSegment: "locations",
    label: "Locations",
    createScreen: createLocationScreen,
    editScreen: item =>
      openFormFrame({
        params: buildEditLocationScreen(item as LocationResponseDto),
      }),
    viewPath: item => `/collection/locations/${item.id}`,
    deleteEndpoint: (item: CollectionPanelItem) =>
      `game-api/locations/${item.id}`,
  },
  {
    category: GameDataType.HELPER,
    routeSegment: "helpers",
    label: "Helpers",
    createScreen: createHelperScreen,
    editScreen: item =>
      openFormFrame({
        params: buildEditHelperScreen(item as HelperResponseDto),
      }),
    viewPath: item => `/collection/helpers/${item.id}`,
    deleteEndpoint: (item: CollectionPanelItem) =>
      `game-api/helpers/${item.id}`,
  },
  {
    category: GameDataType.SET,
    routeSegment: "sets",
    label: "Sets",
    createScreen: createSetScreen,
    editScreen: item =>
      openFormFrame({ params: buildEditSetScreen(item as SetResponseDto) }),
    deleteEndpoint: (item: CollectionPanelItem) => `game-api/sets/${item.id}`,
  },
  {
    category: GameDataType.SCORING_SCHEMA,
    routeSegment: "scoring-schemas",
    label: "Scoring Schemas",
    createAction: () => openScoringSchemaEditorFrame({ params: {} }),
    editScreen: item =>
      openScoringSchemaEditorFrame({
        params: { schema: item as ScoringSchemaResponseDto },
      }),
    deleteEndpoint: (item: CollectionPanelItem) =>
      `game-api/scoring-schemas/${item.id}`,
  },
];

const mapCollectionItemsFromResponse = (data: {
  results: { detail?: CollectionPanelDetailsByType[CollectionPanelCategory] }[];
}): CollectionPanelItem[] => {
  return data.results.flatMap(result =>
    result.detail ? [result.detail as CollectionPanelItem] : [],
  );
};

export const CollectionPanel: React.FC<CollectionPanelProps> = (
  props: CollectionPanelProps,
) => {
  const { content } = props;

  return (
    <EntityPanel<
      CollectionPanelCategory,
      CollectionPanelItem,
      CollectionPanelDetailsByType
    >
      title="Collection panel"
      basePath="/collection"
      searchEndpoint="game-api/search"
      tabs={COLLECTION_TABS}
      content={content}
      includeDetail
      getItemsFromResponse={mapCollectionItemsFromResponse}
      fetchErrorMessage="Unable to load collection items"
    />
  );
};
