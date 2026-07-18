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

// TODO: make the buttons pretty
export const MainActions: FC<MainActionsProps> = ({
  frameId,
  allowShuffle = false,
  allowConfirm = true,
  confirmEnabled,
  confirmCallback,
}: MainActionsProps) => {
  const dispatch = useAppDispatch();

  return (
    <div className="main-actions">
      <button
        key={"cancel"}
        type="button"
        onClick={() => dispatch(closeFrame({ id: frameId }))}
      >
        Cancel
      </button>
      {allowShuffle && (
        <button
          key={"shuffle"}
          type="button"
          // TODO: create the shuffle action
          onClick={() => null}
        >
          Shuffle
        </button>
      )}
      {allowConfirm && (
        <button
          key={"confirm"}
          type="button"
          disabled={!confirmEnabled}
          onClick={confirmCallback}
        >
          Confirm
        </button>
      )}
    </div>
  );
};
