import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import type { RootState } from "../store";
import { clearFormScreenCustomMappings } from "./formScreenCustomMappingRegistry";
import {
    invokeFrameCallback,
    unregisterFrameCallback,
} from "./frameCallbackRegistry";
import {
    addCallbackReceiverToTopFrame,
    closeFrame,
    resetToBottomFrame,
    resetToBottomFrameWithReceiver,
    sameFrameResult,
} from "./frameStackSlice";

type CallbackTokenKey = "callbackEmitterId" | "callbackReceiverId";

const getFrameCallbackToken = (
  frame: unknown,
  key: CallbackTokenKey,
): string | undefined => {
  if (typeof frame !== "object" || frame === null) {
    return undefined;
  }

  const tokenValue = (frame as Record<string, unknown>)[key];
  return typeof tokenValue === "string" ? tokenValue : undefined;
};

const getFrameId = (frame: unknown): string | undefined => {
  if (typeof frame !== "object" || frame === null) {
    return undefined;
  }

  const frameId = (frame as Record<string, unknown>).id;
  return typeof frameId === "string" ? frameId : undefined;
};

const callbackTokensOf = (frame: unknown): string[] => {
  const emitterToken = getFrameCallbackToken(frame, "callbackEmitterId");
  const receiverToken = getFrameCallbackToken(frame, "callbackReceiverId");

  return [emitterToken, receiverToken].filter(
    (token): token is string => token !== undefined,
  );
};

const unregisterRemovedFrameCallbacks = (
  previousStack: unknown[],
  nextStack: unknown[],
) => {
  const activeTokens = new Set(
    nextStack.flatMap(frame => callbackTokensOf(frame)),
  );

  previousStack
    .flatMap(frame => callbackTokensOf(frame))
    .filter(token => !activeTokens.has(token))
    .forEach(unregisterFrameCallback);

  const activeFrameIds = new Set(
    nextStack
      .map(frame => getFrameId(frame))
      .filter((frameId): frameId is string => frameId !== undefined),
  );

  previousStack
    .map(frame => getFrameId(frame))
    .filter((frameId): frameId is string => frameId !== undefined)
    .filter(frameId => !activeFrameIds.has(frameId))
    .forEach(clearFormScreenCustomMappings);
};

export const frameStackListenerMiddleware = createListenerMiddleware();

frameStackListenerMiddleware.startListening({
  actionCreator: closeFrame,
  effect: (action, listenerApi) => {
    const previousStack = (listenerApi.getOriginalState() as RootState)
      .frameStack.stack;
    const nextStack = (listenerApi.getState() as RootState).frameStack.stack;

    const frameToClose = previousStack.at(-1);
    const newTopFrame = nextStack.at(-1);

    if (!frameToClose || !newTopFrame) {
      return;
    }

    if (action.payload.result) {
      const callbackToken =
        getFrameCallbackToken(frameToClose, "callbackEmitterId") ??
        getFrameCallbackToken(newTopFrame, "callbackReceiverId");
      if (callbackToken) {
        invokeFrameCallback(callbackToken, action.payload.result);
      }
    }

    unregisterRemovedFrameCallbacks(previousStack, nextStack);
  },
});

frameStackListenerMiddleware.startListening({
  actionCreator: sameFrameResult,
  effect: (action, listenerApi) => {
    const topFrame = (listenerApi.getState() as RootState).frameStack.stack.at(
      -1,
    );
    if (!topFrame) {
      return;
    }

    const callbackToken =
      getFrameCallbackToken(topFrame, "callbackEmitterId") ??
      getFrameCallbackToken(topFrame, "callbackReceiverId");
    if (!callbackToken) {
      return;
    }

    invokeFrameCallback(callbackToken, action.payload.result);
  },
});

frameStackListenerMiddleware.startListening({
  matcher: isAnyOf(
    resetToBottomFrame,
    resetToBottomFrameWithReceiver,
    addCallbackReceiverToTopFrame,
  ),
  effect: (_action, listenerApi) => {
    const previousStack = (listenerApi.getOriginalState() as RootState)
      .frameStack.stack;
    const nextStack = (listenerApi.getState() as RootState).frameStack.stack;

    unregisterRemovedFrameCallbacks(previousStack, nextStack);

    const previousTopFrame = previousStack.at(-1);
    const nextTopFrame = nextStack.at(-1);
    const previousTopFrameId = getFrameId(previousTopFrame);
    const nextTopFrameId = getFrameId(nextTopFrame);
    const previousReceiverToken = getFrameCallbackToken(
      previousTopFrame,
      "callbackReceiverId",
    );
    const nextReceiverToken = getFrameCallbackToken(
      nextTopFrame,
      "callbackReceiverId",
    );

    if (
      previousTopFrameId === nextTopFrameId &&
      previousReceiverToken &&
      previousReceiverToken !== nextReceiverToken
    ) {
      unregisterFrameCallback(previousReceiverToken);
    }
  },
});
