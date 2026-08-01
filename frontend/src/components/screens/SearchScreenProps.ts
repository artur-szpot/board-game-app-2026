import type { FrameProps } from "../../store/features/frame-actions";
import type {
  GameDataType,
  SelectionResult,
  SelectionScreenProps,
} from "./selection-strategies";

export type SearchScreenProps = SelectionScreenProps & {
  dataTypes: GameDataType[];
  initialSearchTerm?: string;
  currentSelection?: SelectionResult[];
};

export type SearchScreenPropsFull = SearchScreenProps & FrameProps;
