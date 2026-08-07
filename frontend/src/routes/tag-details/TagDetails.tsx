import { Alert } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router";

import { FrameStackScreenWrapper } from "../../components/frames/FrameStackScreenWrapper";
import { TagDetailsScreen } from "../../components/screens/TagDetailsScreen";
import {
    resetToBottomFrame,
    selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export const TagDetails = () => {
  const dispatch = useAppDispatch();
  const topFrame = useAppSelector(selectTopFrame);
  const { id: tagId } = useParams<{ id?: string }>();

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch]);

  if (!tagId || !topFrame) {
    return <Alert severity="error">404</Alert>;
  }

  return (
    <FrameStackScreenWrapper>
      <TagDetailsScreen
        tagId={tagId}
        openedAsFrame={false}
        frameId={topFrame.id}
      />
    </FrameStackScreenWrapper>
  );
};
