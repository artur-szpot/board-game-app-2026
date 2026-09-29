import type { ScoringSchemaResponseDto } from "../../dto/collection-items.dto";
import type { FrameProps } from "../../store/features/frame-actions";

export type ScoreEntryScreenProps = {
  gameId: string;
  gameName: string;
  schema: ScoringSchemaResponseDto;
};

export type ScoreEntryScreenPropsFull = ScoreEntryScreenProps & FrameProps;
