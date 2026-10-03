import type { SetResponseDto } from "../../dto/collection-items.dto";
import type { FrameProps } from "../../store/features/frame-actions";

export type SetEditorScreenProps = { set?: SetResponseDto; readOnly?: boolean };
export type SetEditorScreenPropsFull = SetEditorScreenProps & FrameProps;
