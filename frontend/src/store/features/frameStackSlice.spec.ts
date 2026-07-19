import { describe, expect, it } from "vitest";

import {
  selectionStrategyChooseOne,
  GameDataType,
  selectionStrategySelectNumber,
} from "../../components/screens/selection-strategies";
import {
  closeFrame,
  frameStackSlice,
  FrameTypeEnum,
  openOptionsFrame,
  openSearchFrame,
  resetToBottomFrame,
} from "./frameStackSlice";
import type { OptionsScreenProps } from "../../components/screens/OptionsScreenProps";
import { ActionEnum } from "./frame-actions";

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

describe("frameStackSlice", () => {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callbackReceiver: expect.any(Function),
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
});
