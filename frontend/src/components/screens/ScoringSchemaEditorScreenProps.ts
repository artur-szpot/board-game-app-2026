import type { ScoringSchemaResponseDto } from "../../dto/collection-items.dto";
import type { FrameProps } from "../../store/features/frame-actions";

export type ScoringSchemaEditorScreenProps = {
  // Absent when creating a new schema.
  schema?: ScoringSchemaResponseDto;
};

export type ScoringSchemaEditorScreenPropsFull =
  ScoringSchemaEditorScreenProps & FrameProps;
