import WarningIcon from "@mui/icons-material/Warning";
import { Button, Stack } from "@mui/material";
import { type FC } from "react";

import type { FrameProps } from "../store/features/frame-actions";
import { closeFrame } from "../store/features/frameStackSlice";
import { useAppDispatch } from "../store/hooks";

export type MainActionsProps = FrameProps & {
  allowShuffle?: boolean;
  allowConfirm?: boolean;
  confirmEnabled: boolean;
  confirmCallback: () => void;
  errorCount?: number;
  onShowErrors?: () => void;
};

export const MainActions: FC<MainActionsProps> = ({
  frameId,
  allowShuffle = false,
  allowConfirm = true,
  confirmEnabled,
  confirmCallback,
  errorCount = 0,
  onShowErrors,
}: MainActionsProps) => {
  const dispatch = useAppDispatch();

  return (
    <Stack className="main-actions" direction="row" spacing={1.25}>
      <Button
        variant="outlined"
        color="inherit"
        type="button"
        onClick={() => dispatch(closeFrame({ id: frameId }))}
      >
        Cancel
      </Button>
      {allowShuffle && (
        <Button
          variant="outlined"
          color="inherit"
          type="button"
          // TODO: create the shuffle action
          onClick={() => null}
        >
          Shuffle
        </Button>
      )}
      {allowConfirm && (
        <Button
          variant="contained"
          type="button"
          disabled={!confirmEnabled}
          onClick={confirmCallback}
        >
          Confirm
        </Button>
      )}
      {errorCount > 0 && (
        <Button
          className="main-actions-error-count"
          variant="contained"
          color="error"
          type="button"
          startIcon={<WarningIcon />}
          aria-label={`Show ${errorCount.toString()} form errors`}
          onClick={onShowErrors}
        >
          {errorCount}
        </Button>
      )}
    </Stack>
  );
};
