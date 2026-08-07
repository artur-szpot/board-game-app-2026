import type React from "react";

import { createGameScreen } from "../../components/screens/definitions/create-game";
import { createLocationScreen } from "../../components/screens/definitions/create-location";
import { createTagScreen } from "../../components/screens/definitions/create-tag";
import { GameDataType } from "../../components/screens/selection-strategies";
import { openGameDetailsFrame } from "../../store/features/frameStackSlice";
import type { EntityPanelTab } from "../entity-panel/entity-panel-types";
import { EntityPanel } from "../entity-panel/EntityPanel";
import type {
  CollectionPanelCategory,
  CollectionPanelDetailsByType,
  CollectionPanelItem,
  CollectionPanelProps,
} from "./collection-types";

const COLLECTION_TABS: EntityPanelTab<
  CollectionPanelCategory,
  CollectionPanelItem
>[] = [
  {
    category: GameDataType.GAME,
    routeSegment: "games",
    label: "Games",
    createScreen: createGameScreen,
    viewScreen: item => openGameDetailsFrame({ params: { gameId: item.id } }),
    deleteEndpoint: (item: CollectionPanelItem) => `game-api/games/${item.id}`,
  },
  {
    category: GameDataType.TAG,
    routeSegment: "tags",
    label: "Tags",
    createScreen: createTagScreen,
    deleteEndpoint: (item: CollectionPanelItem) => `game-api/tags/${item.id}`,
  },
  {
    category: GameDataType.LOCATION,
    routeSegment: "locations",
    label: "Locations",
    createScreen: createLocationScreen,
    deleteEndpoint: (item: CollectionPanelItem) =>
      `game-api/locations/${item.id}`,
  },
  {
    category: GameDataType.HELPER,
    routeSegment: "helpers",
    label: "Helpers",
    deleteEndpoint: (item: CollectionPanelItem) =>
      `game-api/helpers/${item.id}`,
  },
  {
    category: GameDataType.SCORING_SCHEMA,
    routeSegment: "scoring-schemas",
    label: "Scoring Schemas",
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
