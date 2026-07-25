import type { FrameCallbackContent, FrameCallbackReceiver } from "./frameStackSlice";

export type FrameCallbackToken = string;

const frameCallbackMap = new Map<FrameCallbackToken, FrameCallbackReceiver>();

export const registerFrameCallback = (
  callback: FrameCallbackReceiver,
): FrameCallbackToken => {
  const token = crypto.randomUUID();
  frameCallbackMap.set(token, callback);
  return token;
};

export const invokeFrameCallback = (
  token: FrameCallbackToken,
  result: FrameCallbackContent,
): boolean => {
  const callback = frameCallbackMap.get(token);
  if (!callback) {
    return false;
  }
  callback(result);
  return true;
};

export const unregisterFrameCallback = (
  token: FrameCallbackToken | undefined,
): void => {
  if (!token) {
    return;
  }
  frameCallbackMap.delete(token);
};

export const clearFrameCallbacks = (): void => {
  frameCallbackMap.clear();
};
