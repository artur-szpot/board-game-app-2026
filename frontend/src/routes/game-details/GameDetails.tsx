import { Alert } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router";

import { FrameStackScreenWrapper } from "../../components/frames/FrameStackScreenWrapper";
import { GameDetailsScreen } from "../../components/screens/GameDetailsScreen";
import {
  resetToBottomFrame,
  selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export const GameDetails = () => {
  const dispatch = useAppDispatch();
  const topFrame = useAppSelector(selectTopFrame);
  const { id: gameId } = useParams<{ id?: string }>();

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch]);

  if (!gameId || !topFrame) {
    return <Alert severity="error">404</Alert>;
  }

  return (
    <FrameStackScreenWrapper>
      <GameDetailsScreen
        gameId={gameId}
        openedAsFrame={false}
        frameId={topFrame.id}
      />
    </FrameStackScreenWrapper>
  );
};
