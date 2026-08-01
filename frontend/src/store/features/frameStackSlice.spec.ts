import { beforeEach, describe, expect, it } from "vitest";

import { formSearch } from "../../components/forms/FormSearchField";
import type { OptionsScreenProps } from "../../components/screens/OptionsScreenProps";
import {
    GameDataType,
    ResultMappingStrategy,
    selectionStrategyChooseOne,
    selectionStrategySelectNumber,
} from "../../components/screens/selection-strategies";
import { makeStore } from "../store";
import { ActionEnum } from "./frame-actions";
import {
    clearFrameCallbacks,
    invokeFrameCallback,
} from "./frameCallbackRegistry";
import {
    closeFrame,
    frameStackSlice,
    FrameTypeEnum,
    openFormFrame,
    openGameDetailsFrame,
    openOptionsFrame,
    openSearchFrame,
    resetToBottomFrame,
    sameFrameResult,
} from "./frameStackSlice";

const initialState = frameStackSlice.getInitialState();

const mockOptionsProps: { params: OptionsScreenProps } = {
  params: {
    dataType: GameDataType.OTHER,
    options: [
      {
        label: "Option 1",
        value: "1",
      },
      {
        label: "Option 2",
        value: "2",
      },
      {
        label: "Option 3",
        value: "3",
      },
    ],
    strategy: selectionStrategyChooseOne(),
    title: "Test Options Screen",
  },
};

const getPayloadToken = (action: unknown, key: string): string | undefined => {
  if (typeof action !== "object" || action === null || !("payload" in action)) {
    return undefined;
  }

  const payload = action.payload;
  if (typeof payload !== "object" || payload === null || !(key in payload)) {
    return undefined;
  }

  const token = payload[key as keyof typeof payload];
  return typeof token === "string" ? token : undefined;
};

describe("frameStackSlice", () => {
  beforeEach(() => {
    clearFrameCallbacks();
  });

  it("should initialize with BOTTOM FRAME", () => {
    expect(initialState.stack).toHaveLength(1);
    expect(initialState.stack[0]).toMatchObject({
      frameType: FrameTypeEnum.SELF,
    });
  });

  it("should open a new frame", () => {
    const nextState = frameStackSlice.reducer(
      initialState,
      openSearchFrame({
        params: {
          title: "test",
          dataTypes: [GameDataType.GAME],
          strategy: selectionStrategySelectNumber({ min: 2 }),
        },
      }),
    );

    expect(nextState.stack).toHaveLength(2);
    expect(nextState.stack[1]).toMatchObject({
      frameType: FrameTypeEnum.SEARCH,
      params: { title: "test", dataTypes: [GameDataType.GAME] },
      callbackReceiverId: undefined,
    });
  });

  it("should open a game details frame", () => {
    const nextState = frameStackSlice.reducer(
      initialState,
      openGameDetailsFrame({ params: { gameId: "game-1" } }),
    );

    expect(nextState.stack).toHaveLength(2);
    expect(nextState.stack[1]).toMatchObject({
      frameType: FrameTypeEnum.GAME_DETAILS,
      params: {
        gameId: "game-1",
        openedAsFrame: true,
      },
      callbackReceiverId: undefined,
    });
  });

  it("should close top frame with without callback if no result produced", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openSearchFrame({
        params: {
          title: "test",
          dataTypes: [GameDataType.GAME],
          strategy: selectionStrategySelectNumber({ min: 2 }),
        },
      }),
    );
    const nextState = frameStackSlice.reducer(
      state,
      closeFrame({
        id: state.stack.at(-1)?.id ?? "",
        result: { action: ActionEnum.CHOICE_MADE, payload: { a: true } },
      }),
    );

    expect(nextState.stack).toHaveLength(1);
    expect(nextState.stack[0].frameType).toBe(FrameTypeEnum.SELF);
  });

  it("should throw when closing non-top frame", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openOptionsFrame(mockOptionsProps),
    );
    const nestedState = frameStackSlice.reducer(
      state,
      openSearchFrame({
        params: {
          title: "test",
          dataTypes: [GameDataType.GAME],
          strategy: selectionStrategySelectNumber({ min: 2 }),
        },
      }),
    );
    expect(() =>
      frameStackSlice.reducer(
        nestedState,
        closeFrame({
          id: state.stack[1].id,
        }),
      ),
    ).toThrow();
  });

  it("should throw when closing bottom frame", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openOptionsFrame(mockOptionsProps),
    );
    expect(() =>
      frameStackSlice.reducer(
        state,
        closeFrame({
          id: state.stack[0].id,
        }),
      ),
    ).toThrow();
  });

  it("should reset stack to bottom frame", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openSearchFrame({
        params: {
          title: "test",
          dataTypes: [GameDataType.GAME],
          strategy: selectionStrategySelectNumber({ min: 2 }),
        },
      }),
    );
    const resetState = frameStackSlice.reducer(state, resetToBottomFrame());

    expect(resetState.stack).toHaveLength(1);
    expect(resetState.stack[0].frameType).toBe(FrameTypeEnum.SELF);
  });

  it("should send same-frame result to top frame receiver when emitter is missing", () => {
    const receiver = vi.fn();
    const store = makeStore();

    store.dispatch(
      openFormFrame({
        params: {
          title: "test form",
          method: "POST",
          action: "some/path",
          fields: [],
        },
        callbackReceiver: receiver,
      }),
    );

    store.dispatch(
      sameFrameResult({
        result: {
          action: ActionEnum.CHOICE_MADE,
          payload: { chosen: [] },
        },
      }),
    );

    expect(receiver).toHaveBeenCalledWith({
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen: [] },
    });
  });

  it("should unregister callback emitter after closing a frame", () => {
    const emitter = vi.fn();
    const store = makeStore();

    const openAction = store.dispatch(
      openOptionsFrame({
        ...mockOptionsProps,
        callbackEmitter: emitter,
      }),
    );

    const callbackToken = getPayloadToken(openAction, "callbackEmitterId");
    expect(callbackToken).toBeDefined();

    const topFrameId = store.getState().frameStack.stack.at(-1)?.id;
    expect(topFrameId).toBeDefined();

    store.dispatch(
      closeFrame({
        id: topFrameId ?? "",
        result: {
          action: ActionEnum.CHOICE_MADE,
          payload: { chosen: [] },
        },
      }),
    );

    expect(emitter).toHaveBeenCalledWith({
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen: [] },
    });

    const invokedAfterCleanup = invokeFrameCallback(callbackToken ?? "", {
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen: [] },
    });
    expect(invokedAfterCleanup).toBe(false);
  });

  it("should unregister callback receiver after resetting to bottom frame", () => {
    const receiver = vi.fn();
    const store = makeStore();

    const openAction = store.dispatch(
      openSearchFrame({
        params: {
          title: "test",
          dataTypes: [GameDataType.GAME],
          strategy: selectionStrategySelectNumber({ min: 1 }),
        },
        callbackReceiver: receiver,
      }),
    );

    const callbackToken = getPayloadToken(openAction, "callbackReceiverId");
    expect(callbackToken).toBeDefined();

    store.dispatch(resetToBottomFrame());

    const invokedAfterCleanup = invokeFrameCallback(callbackToken ?? "", {
      action: ActionEnum.CHOICE_MADE,
      payload: { chosen: [] },
    });
    expect(invokedAfterCleanup).toBe(false);
    expect(receiver).not.toHaveBeenCalled();
  });

  it("should not store custom mapping functions in frame stack state", () => {
    const store = makeStore();

    store.dispatch(
      openFormFrame({
        params: {
          title: "test form",
          method: "POST",
          action: "some/path",
          fields: [
            formSearch({
              name: "locations",
              label: "Locations",
              resultMapping: ResultMappingStrategy.CUSTOM,
              customMapping: item => ({ value: item.value }),
              params: {
                title: "Find locations",
                dataTypes: [GameDataType.LOCATION],
                strategy: selectionStrategySelectNumber({ min: 1 }),
              },
            }),
          ],
        },
      }),
    );

    const topFrame = store.getState().frameStack.stack.at(-1);
    expect(topFrame?.frameType).toBe(FrameTypeEnum.FORM);

    const formParams = topFrame?.params as
      | { fields?: Record<string, unknown>[] }
      | undefined;
    expect(formParams?.fields).toHaveLength(1);
    expect(formParams?.fields?.[0]).not.toHaveProperty("customMapping");
  });
});
