import { Alert } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router";

import { FrameStackScreenWrapper } from "../../components/frames/FrameStackScreenWrapper";
import { LocationDetailsScreen } from "../../components/screens/LocationDetailsScreen";
import {
    resetToBottomFrame,
    selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export const LocationDetails = () => {
  const dispatch = useAppDispatch();
  const topFrame = useAppSelector(selectTopFrame);
  const { id: locationId } = useParams<{ id?: string }>();

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch]);

  if (!locationId || !topFrame) {
    return <Alert severity="error">404</Alert>;
  }

  return (
    <FrameStackScreenWrapper>
      <LocationDetailsScreen
        locationId={locationId}
        openedAsFrame={false}
        frameId={topFrame.id}
      />
    </FrameStackScreenWrapper>
  );
};
