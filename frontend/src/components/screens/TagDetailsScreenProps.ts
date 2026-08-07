import type { FrameProps } from "../../store/features/frame-actions";

export type TagDetailsScreenProps = {
  tagId: string;
  openedAsFrame?: boolean;
};

export type TagDetailsScreenPropsFull = TagDetailsScreenProps & FrameProps;
