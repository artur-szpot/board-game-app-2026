import type { PayloadAction } from "@reduxjs/toolkit";

import { createAppSlice } from "../createAppSlice";

export type FrameCallbackContent = {
  action: string;
  payload?: Record<string, unknown>;
};

export type FrameStackItem = {
  id: string;
  frameName: string;
  callbackReceiver: (result: FrameCallbackContent) => void;
  state: Record<string, unknown>;
};

export type FrameStackDto = Pick<FrameStackItem, "frameName"> & {
  state?: FrameStackItem["state"];
  callbackReceiver?: FrameStackItem["callbackReceiver"];
};

export type FrameStackState = {
  stack: FrameStackItem[];
};

const initialState: FrameStackState = {
  stack: [
    {
      id: "bottom_frame",
      frameName: "BOTTOM FRAME",
      callbackReceiver: () => null,
      state: {}
    },
  ],
};

export const frameStackSlice = createAppSlice({
  name: "frameStack",
  initialState,
  reducers: create => ({
    openFrame: create.reducer(
      (state: FrameStackState, action: PayloadAction<FrameStackDto>) => {
        const id = crypto.randomUUID();
        state.stack.push({
          id,
          frameName: action.payload.frameName,
          state: action.payload.state ?? {},
          callbackReceiver: action.payload.callbackReceiver ?? (() => null),
        });
      },
    ),
    closeFrame: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: string;
          cancel?: boolean;
          result?: FrameCallbackContent;
        }>,
      ) => {
        // If trying to close a frame that isn't on top of the stack, throw.
        if (state.stack.at(-1)?.id !== action.payload.id) {
          throw new Error("Only the top frame of the stack can be closed");
        }
        // Not allowed to close the bottom frame
        if (state.stack.length < 2) {
          throw new Error("The bottom frame of the stack cannot be closed");
        }

        const frameToClose = state.stack.pop();
        const newTopFrame = state.stack.at(-1);
        // Both of these must be defined based on checks above, this is just to silence typescript.
        if (frameToClose === undefined || newTopFrame === undefined) {
          throw new Error(
            "Unknown error: top two frames exist, but don't at the same time",
          );
        }

        // If top frame was cancelled or returned nothing, that's it.
        if (action.payload.cancel || !action.payload.result) {
          return;
        }

        // If new top frame has a receiver, send result there.
        newTopFrame.callbackReceiver(action.payload.result);
      },
    ),
    resetToBottomFrame: create.reducer((state: FrameStackState) => {
      state.stack = [state.stack[0]]
    }),
  }),
});

export const { openFrame, closeFrame, resetToBottomFrame } = frameStackSlice.actions;

export const selectFrameStack = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack;

export const selectTopFrame = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack.at(-1);
