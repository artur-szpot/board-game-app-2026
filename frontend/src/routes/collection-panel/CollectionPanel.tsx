import type React from "react";

import { GameDataType } from "../../components/screens/selection-strategies";
import type { EntityPanelTab } from "../entity-panel/entity-panel-types";
import { EntityPanel } from "../entity-panel/EntityPanel";
import type {
  CollectionPanelCategory,
  CollectionPanelProps,
} from "./collection-types";

const COLLECTION_TABS: EntityPanelTab<CollectionPanelCategory>[] = [
  {
    category: GameDataType.GAME,
    endpoint: "game-api/games",
    routeSegment: "games",
    label: "Games",
  },
  {
    category: GameDataType.TAG,
    endpoint: "game-api/tags",
    routeSegment: "tags",
    label: "Tags",
  },
  {
    category: GameDataType.LOCATION,
    endpoint: "game-api/locations",
    routeSegment: "locations",
    label: "Locations",
  },
  {
    category: GameDataType.HELPER,
    endpoint: "game-api/helpers",
    routeSegment: "helpers",
    label: "Helpers",
  },
  {
    category: GameDataType.SCORING_SCHEMA,
    endpoint: "game-api/scoring-schemas",
    routeSegment: "scoring-schemas",
    label: "Scoring Schemas",
  },
];

export const CollectionPanel: React.FC<CollectionPanelProps> = (
  props: CollectionPanelProps,
) => {
  const { content } = props;

  return (
    <EntityPanel
      title="Collection panel"
      basePath="/collection"
      tabs={COLLECTION_TABS}
      content={content}
      fetchErrorMessage="Unable to load collection items"
    />
  );
};
