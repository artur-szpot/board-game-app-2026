import { Button, Stack } from "@mui/material";
import { type FC } from "react";
import { closeFrame } from "../store/features/frameStackSlice";
import { useAppDispatch } from "../store/hooks";

export type MainActionsProps = {
  frameId: string;
  allowShuffle?: boolean;
  allowConfirm?: boolean;
  confirmEnabled: boolean;
  confirmCallback: () => void;
};

export const MainActions: FC<MainActionsProps> = ({
  frameId,
  allowShuffle = false,
  allowConfirm = true,
  confirmEnabled,
  confirmCallback,
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
    </Stack>
  );
};
