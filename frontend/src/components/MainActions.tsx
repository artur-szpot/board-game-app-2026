import WarningIcon from "@mui/icons-material/Warning";
import { Button, Stack } from "@mui/material";
import { useLayoutEffect, useRef, useState, type FC } from "react";

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
  const actionsRef = useRef<HTMLDivElement>(null);
  const [scrollRequest, setScrollRequest] = useState(0);

  useLayoutEffect(() => {
    if (scrollRequest === 0) {
      return;
    }
    const form = actionsRef.current?.closest(".form-screen");
    const firstError = Array.from(
      form?.querySelectorAll<HTMLElement>(
        '[aria-invalid="true"], .form-field-errors, [data-form-error="true"]',
      ) ?? [],
    ).find(element => !element.closest('[hidden], [aria-hidden="true"]'));
    const target =
      firstError?.closest<HTMLElement>(".MuiFormControl-root") ??
      (firstError?.classList.contains("form-field-errors")
        ? firstError.parentElement
        : firstError);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollRequest]);

  return (
    <Stack
      ref={actionsRef}
      className="main-actions"
      direction="row"
      spacing={1.25}
    >
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
          onClick={() => {
            onShowErrors?.();
            setScrollRequest(current => current + 1);
          }}
        >
          {errorCount}
        </Button>
      )}
    </Stack>
  );
};
