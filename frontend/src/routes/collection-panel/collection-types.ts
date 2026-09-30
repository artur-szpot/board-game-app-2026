import type { GameDataType } from "../../components/screens/selection-strategies";
import type {
    GameResponseDto,
    HelperResponseDto,
    LocationResponseDto,
    ScoringSchemaResponseDto,
    SetResponseDto,
    TagResponseDto,
} from "../../dto/collection-items.dto";

export type CollectionPanelCategory =
  | GameDataType.GAME
  | GameDataType.TAG
  | GameDataType.LOCATION
  | GameDataType.HELPER
  | GameDataType.SET
  | GameDataType.SCORING_SCHEMA;

export type CollectionPanelProps = {
  content?: CollectionPanelCategory;
};

export type CollectionPanelDetailsByType = {
  [GameDataType.GAME]: GameResponseDto;
  [GameDataType.TAG]: TagResponseDto;
  [GameDataType.LOCATION]: LocationResponseDto;
  [GameDataType.HELPER]: HelperResponseDto;
  [GameDataType.SET]: SetResponseDto;
  [GameDataType.SCORING_SCHEMA]: ScoringSchemaResponseDto;
};

export type CollectionPanelItem =
  CollectionPanelDetailsByType[CollectionPanelCategory];
