import type { FrameProps } from "../../store/features/frame-actions";

export type GameDetailsScreenProps = {
  gameId: string;
  openedAsFrame?: boolean;
};

export type GameDetailsScreenPropsFull = GameDetailsScreenProps & FrameProps;
