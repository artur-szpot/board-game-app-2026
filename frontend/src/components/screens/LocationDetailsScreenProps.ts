import type { FrameProps } from "../../store/features/frame-actions";

export type LocationDetailsScreenProps = {
  locationId: string;
  openedAsFrame?: boolean;
};

export type LocationDetailsScreenPropsFull = LocationDetailsScreenProps &
  FrameProps;
