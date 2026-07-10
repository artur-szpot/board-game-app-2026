import { describe, expect, it } from "vitest";

import { frameStackSlice, openFrame, closeFrame, resetToBottomFrame } from "./frameStackSlice";

const initialState = frameStackSlice.getInitialState();

describe("frameStackSlice", () => {
  it("should initialize with BOTTOM FRAME", () => {
    expect(initialState.stack).toHaveLength(1);
    expect(initialState.stack[0]).toMatchObject({ frameName: "BOTTOM FRAME" });
  });

  it("should open a new frame", () => {
    const nextState = frameStackSlice.reducer(
      initialState,
      openFrame({ frameName: "SEARCH", state: { query: "test" } }),
    );

    expect(nextState.stack).toHaveLength(2);
    expect(nextState.stack[1]).toMatchObject({
      frameName: "SEARCH",
      state: { query: "test" },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callbackReceiver: expect.any(Function),
    });
  });

  it("should close top frame with without callback if no result produced", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openFrame({ frameName: "SEARCH" }),
    );
    const nextState = frameStackSlice.reducer(
      state,
      closeFrame({
        id: state.stack.at(-1)?.id ?? "",
        result: { action: "SOME_ACTION", payload: { a: true } },
      }),
    );

    expect(nextState.stack).toHaveLength(1);
    expect(nextState.stack[0].frameName).toBe("BOTTOM FRAME");
  });

  it("should close top frame with without callback if cancelled", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openFrame({ frameName: "SEARCH" }),
    );
    const nextState = frameStackSlice.reducer(
      state,
      closeFrame({ id: state.stack.at(-1)?.id ?? "", cancel: true }),
    );

    expect(nextState.stack).toHaveLength(1);
    expect(nextState.stack[0].frameName).toBe("BOTTOM FRAME");
  });

  it("should throw when closing non-top frame", () => {
    const state = frameStackSlice.reducer(
      initialState,
      openFrame({
        frameName: "LIST",
      }),
    );
    const nestedState = frameStackSlice.reducer(
      state,
      openFrame({ frameName: "DETAIL" }),
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
      openFrame({
        frameName: "LIST",
      }),
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
      openFrame({ frameName: "SEARCH" }),
    );
    const resetState = frameStackSlice.reducer(state, resetToBottomFrame());

    expect(resetState.stack).toHaveLength(1);
    expect(resetState.stack[0].frameName).toBe("BOTTOM FRAME");
  });
});
