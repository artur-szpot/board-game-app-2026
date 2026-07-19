import type {
  SelectionResult,
  SelectionStrategy,
  GameDataType,
} from "./selection-strategies";

export type SearchScreenProps = {
  title: string;
  dataTypes: GameDataType[];
  strategy: SelectionStrategy;
  correctnessStrategy?: SelectionStrategy;
  initialSearchTerm?: string;
  currentSelection?: SelectionResult[];
};

export type SearchScreenPropsFull = SearchScreenProps & {
  frameId: string;
};
