import type { GameDataType } from "../../components/screens/selection-strategies";

export type CollectionPanelCategory =
  | GameDataType.GAME
  | GameDataType.TAG
  | GameDataType.LOCATION
  | GameDataType.HELPER
  | GameDataType.SCORING_SCHEMA;

export type CollectionPanelProps = {
  content?: CollectionPanelCategory;
};
