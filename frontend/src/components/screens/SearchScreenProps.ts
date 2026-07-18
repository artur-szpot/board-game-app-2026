import type {
  SelectionResult,
  SelectionStrategy,
  SelectionType,
} from "./selection-strategies";

export type SearchScreenProps = {
  title: string;
  dataTypes: SelectionType[];
  strategy: SelectionStrategy;
  initialSearchTerm?: string;
  currentSelection?: SelectionResult[];
};

export type SearchScreenPropsFull = SearchScreenProps & {
  frameId: string;
};
