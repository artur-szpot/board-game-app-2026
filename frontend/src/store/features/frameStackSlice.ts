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
  // This function (if present) will be called when the frame itself is being closed.
  callbackEmitter?: FrameCallbackReceiver;
  // This function will be called when the frame on top of it is closed (unless emitter was already called).
  callbackReceiver: FrameCallbackReceiver;
  params:
    | OptionsScreenPropsFull
    | SearchScreenPropsFull
    | FormScreenPropsFull
    | undefined;
  getOptionsScreenProps: () => OptionsScreenPropsFull;
  getSearchScreenProps: () => SearchScreenPropsFull;
  getFormScreenProps: () => FormScreenPropsFull;
};

export type FrameStackDto<T> = {
  params: T;
  callbackEmitter?: FrameStackItem["callbackEmitter"];
  callbackReceiver?: FrameStackItem["callbackReceiver"];
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
      callbackReceiver: () => null,
      params: undefined,
      getOptionsScreenProps: castOptionsScreenProps(
        FrameTypeEnum.SELF,
        undefined,
      ),
      getSearchScreenProps: castSearchScreenProps(
        FrameTypeEnum.SELF,
        undefined,
      ),
      getFormScreenProps: castFormScreenProps(FrameTypeEnum.SELF, undefined),
    },
  ],
};

const createFrame = (
  id: string,
  frameType: FrameTypeEnum,
  params: FrameStackItem["params"],
  callbackReceiver?: FrameStackItem["callbackReceiver"],
  callbackEmitter?: FrameStackItem["callbackEmitter"],
): FrameStackItem => {
  return {
    id,
    frameType,
    params,
    callbackReceiver: callbackReceiver ?? (() => null),
    callbackEmitter: callbackEmitter ?? (() => null),
    getOptionsScreenProps: castOptionsScreenProps(frameType, params),
    getSearchScreenProps: castSearchScreenProps(frameType, params),
    getFormScreenProps: castFormScreenProps(frameType, params),
  };
};

export const frameStackSlice = createAppSlice({
  name: "frameStack",
  initialState,
  reducers: create => ({
    openOptionsFrame: create.reducer(
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackDto<OptionsScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.OPTIONS,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiver,
            action.payload.callbackEmitter,
          ),
        );
      },
    ),
    openSearchFrame: create.reducer(
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackDto<SearchScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.SEARCH,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiver,
            action.payload.callbackEmitter,
          ),
        );
      },
    ),
    openFormFrame: create.reducer(
      (
        state: FrameStackState,
        action: PayloadAction<FrameStackDto<FormScreenProps>>,
      ) => {
        const id = crypto.randomUUID();
        state.stack.push(
          createFrame(
            id,
            FrameTypeEnum.FORM,
            { ...action.payload.params, frameId: id },
            action.payload.callbackReceiver,
            action.payload.callbackEmitter,
          ),
        );
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

        // If the frame being closed has an emitter, send result there and finish processing.
        if (frameToClose.callbackEmitter) {
          frameToClose.callbackEmitter(action.payload.result);
          return;
        }

        // If new top frame has a receiver, send result there.
        newTopFrame.callbackReceiver(action.payload.result);
      },
    ),
    resetToBottomFrame: create.reducer((state: FrameStackState) => {
      state.stack = [state.stack[0]];
      state.stack[0].callbackReceiver = () => null;
    }),
    resetToBottomFrameWithReceiver: create.reducer(
      (
        state: FrameStackState,
        action: PayloadAction<FrameCallbackReceiver>,
      ) => {
        state.stack = [state.stack[0]];
        state.stack[0].callbackReceiver = action.payload;
      },
    ),
  }),
});

export const {
  openOptionsFrame,
  openSearchFrame,
  openFormFrame,
  closeFrame,
  resetToBottomFrame,
  resetToBottomFrameWithReceiver,
} = frameStackSlice.actions;

export const selectFrameStack = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack;

export const selectTopFrame = (state: { frameStack: FrameStackState }) =>
  state.frameStack.stack.at(-1);
