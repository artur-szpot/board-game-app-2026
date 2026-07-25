import type { PayloadAction } from "@reduxjs/toolkit";

import type {
  FormScreenProps,
  FormScreenPropsFull,
} from "../../components/screens/FormScreenProps";
import type {
  OptionsScreenProps,
  OptionsScreenPropsFull,
} from "../../components/screens/OptionsScreenProps";
import type {
  SearchScreenProps,
  SearchScreenPropsFull,
} from "../../components/screens/SearchScreenProps";
import { createAppSlice } from "../createAppSlice";
import {
  registerFrameCallback,
  type FrameCallbackToken,
} from "./frameCallbackRegistry";
import type { ActionEnum } from "./frame-actions";

export type FrameCallbackContent = {
  action: ActionEnum;
  payload?: Record<string, unknown>;
};

export enum FrameTypeEnum {
  SELF = "SELF",
  OPTIONS = "OPTIONS",
  SEARCH = "SEARCH",
  FORM = "FORM",
}

export type FrameCallbackReceiver = (result: FrameCallbackContent) => void;

export type FrameStackItem = {
  id: string;
  frameType: FrameTypeEnum;
  // If present, receives close/same-frame result for this frame.
  callbackEmitterId?: FrameCallbackToken;
  // Receives close/same-frame result from top frame when emitter is missing.
  callbackReceiverId?: FrameCallbackToken;
  params:
    | OptionsScreenPropsFull
    | SearchScreenPropsFull
    | FormScreenPropsFull
    | undefined;
};

export type FrameStackDto<T> = {
  params: T;
  callbackEmitter?: FrameCallbackReceiver;
  callbackReceiver?: FrameCallbackReceiver;
};

type FrameStackReducerDto<T> = {
  params: T;
  callbackEmitterId?: FrameCallbackToken;
  callbackReceiverId?: FrameCallbackToken;
};

export type FrameStackState = {
  stack: FrameStackItem[];
};

const castOptionsScreenProps =
  (frameType: FrameTypeEnum, params: unknown) => () => {
    if (frameType !== FrameTypeEnum.OPTIONS) {
      throw new Error(
        `Trying to extract OptionsScreenProps from a ${frameType} frame`,
      );
    }
    return params as OptionsScreenPropsFull;
  };
const castSearchScreenProps =
  (frameType: FrameTypeEnum, params: unknown) => () => {
    if (frameType !== FrameTypeEnum.SEARCH) {
      throw new Error(
        `Trying to extract SearchScreenProps from a ${frameType} frame`,
      );
    }
    return params as SearchScreenPropsFull;
  };
const castFormScreenProps =
  (frameType: FrameTypeEnum, params: unknown) => () => {
    if (frameType !== FrameTypeEnum.FORM) {
      throw new Error(
        `Trying to extract FormScreenProps from a ${frameType} frame`,
      );
    }
    return params as FormScreenPropsFull;
  };

const initialState: FrameStackState = {
  stack: [
    {
      id: "bottom_frame",
      frameType: FrameTypeEnum.SELF,
      params: undefined,
    },
  ],
};

const createFrame = (
  id: string,
  frameType: FrameTypeEnum,
  params: FrameStackItem["params"],
  callbackReceiverId?: FrameStackItem["callbackReceiverId"],
  callbackEmitterId?: FrameStackItem["callbackEmitterId"],
): FrameStackItem => {
  return {
    id,
    frameType,
    params,
    callbackReceiverId,
    callbackEmitterId,
  };
};

export const frameStackSlice = createAppSlice({
  name: "frameStack",
  initialState,
  reducers: create => ({
    openOptionsFrame: create.preparedReducer(
      (payload: FrameStackDto<OptionsScreenProps>) => ({
        payload: {
          params: payload.params,
          callbackReceiverId: payload.callbackReceiver
            ? registerFrameCallback(payload.callbackReceiver)
            : undefined,
          callbackEmitterId: payload.callbackEmitter
            ? registerFrameCallback(payload.callbackEmitter)
            : undefined,
        },
      }),
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackReducerDto<OptionsScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.OPTIONS,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiverId,
            action.payload.callbackEmitterId,
          ),
        );
      },
    ),
    openSearchFrame: create.preparedReducer(
      (payload: FrameStackDto<SearchScreenProps>) => ({
        payload: {
          params: payload.params,
          callbackReceiverId: payload.callbackReceiver
            ? registerFrameCallback(payload.callbackReceiver)
            : undefined,
          callbackEmitterId: payload.callbackEmitter
            ? registerFrameCallback(payload.callbackEmitter)
            : undefined,
        },
      }),
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackReducerDto<SearchScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.SEARCH,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiverId,
            action.payload.callbackEmitterId,
          ),
        );
      },
    ),
    openFormFrame: create.preparedReducer(
      (payload: FrameStackDto<FormScreenProps>) => ({
        payload: {
          params: payload.params,
          callbackReceiverId: payload.callbackReceiver
            ? registerFrameCallback(payload.callbackReceiver)
            : undefined,
          callbackEmitterId: payload.callbackEmitter
            ? registerFrameCallback(payload.callbackEmitter)
            : undefined,
        },
      }),
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackReducerDto<FormScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.FORM,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiverId,
            action.payload.callbackEmitterId,
          ),
        );
      },
    ),
    closeFrame: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: string;
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

        // If top frame returned nothing, that's it (most likely cancelled).
        if (!action.payload.result) {
          return;
        }
      },
    ),
    sameFrameResult: create.reducer(
      (
        state,
        _action: PayloadAction<{
          result: FrameCallbackContent;
        }>,
      ) => {
        const topFrame = state.stack.at(-1);
        // It must be defined based on checks above, this is just to silence typescript.
        if (topFrame === undefined) {
          throw new Error(
            "Unknown error: top frame exists, but doesn't at the same time",
          );
        }
      },
    ),
    resetToBottomFrame: create.reducer((state: FrameStackState) => {
      state.stack = [state.stack[0]];
      state.stack[0].callbackReceiverId = undefined;
    }),
    resetToBottomFrameWithReceiver: create.preparedReducer(
      (receiver: FrameCallbackReceiver) => ({
        payload: registerFrameCallback(receiver),
      }),
      (
        state: FrameStackState,
        action: PayloadAction<FrameCallbackToken>,
      ) => {
        state.stack = [state.stack[0]];
        state.stack[0].callbackReceiverId = action.payload;
      },
    ),
    addCallbackReceiverToTopFrame: create.preparedReducer(
      (receiver: FrameCallbackReceiver) => ({
        payload: registerFrameCallback(receiver),
      }),
      (
        state: FrameStackState,
        action: PayloadAction<FrameCallbackToken>,
      ) => {
        const topFrame = state.stack.at(-1);
        if (topFrame === undefined) {
          throw new Error("No frames in the stack");
        }
        topFrame.callbackReceiverId = action.payload;
      },
    ),
  }),
});

export const {
  openOptionsFrame,
  openSearchFrame,
  openFormFrame,
  closeFrame,
  sameFrameResult,
  resetToBottomFrame,
  resetToBottomFrameWithReceiver,
  addCallbackReceiverToTopFrame,
} = frameStackSlice.actions;

export const selectFrameStack = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack;

export const selectTopFrame = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack.at(-1);

export const frameStackTypeGuards = {
  toOptionsScreenProps: castOptionsScreenProps,
  toSearchScreenProps: castSearchScreenProps,
  toFormScreenProps: castFormScreenProps,
};
