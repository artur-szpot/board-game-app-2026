import { describe, expect, it, vi } from "vitest";

import type { RandomizerApi } from "../../api/randomizer";
import {
    conditionPasses,
    initialRunnerState,
    parseDiceFormula,
    planRandomization,
    runAutomaticStep,
    runnerReducer,
    runRandomization,
    type RunnerState,
} from "./helper-engine";
import { buildTestHelperLogic, TEST_SETS } from "./test-helper-logic";

const logic = buildTestHelperLogic();

const fakeApi = (overrides: Partial<RandomizerApi> = {}): RandomizerApi => ({
  getTeams: vi.fn(),
  getPlayers: vi.fn(),
  rollDice: vi.fn().mockResolvedValue([1, 2, 3, 4]),
  choose: vi.fn(async (items: number[], count: number) =>
    Promise.resolve(items.slice(0, count)),
  ),
  ...overrides,
});

const interactiveAt = (
  stepIndex: number,
  variables: RunnerState["variables"] = {},
): RunnerState => ({
  ...initialRunnerState(),
  phase: "interactive",
  stepIndex,
  variables,
});

describe("runnerReducer", () => {
  it("records history and randomizes after completing a step", () => {
    const state = runnerReducer(interactiveAt(1), {
      type: "COMPLETE_STEP",
      completion: { values: { mode: "coffee" } },
    });

    expect(state).toMatchObject({
      phase: "randomizing",
      cursor: 2,
      variables: { mode: "coffee" },
    });
    expect(state.history).toEqual([
      { stepIndex: 1, variables: {}, roster: undefined },
    ]);
  });

  it("unsets skipped variables and clears the roster when asked", () => {
    const start = {
      ...interactiveAt(0, { PLAYERS: [0, 1], TEAM: 0 }),
      roster: { team: { id: "t", name: "T" }, players: [] },
    };
    const state = runnerReducer(start, {
      type: "COMPLETE_STEP",
      completion: { values: {}, unset: ["PLAYERS", "TEAM"], roster: undefined },
    });

    expect(state.variables).toEqual({});
    expect(state.roster).toBeUndefined();
  });

  it("restores the previous snapshot on BACK", () => {
    const completed = runnerReducer(interactiveAt(1), {
      type: "COMPLETE_STEP",
      completion: { values: { mode: "vanilla" } },
    });
    const randomized = runnerReducer(completed, {
      type: "RANDOMIZED",
      values: { governor: 7 },
      cleared: [],
      nextIndex: 2,
    });

    const back = runnerReducer(randomized, { type: "BACK" });

    expect(back).toMatchObject({
      phase: "interactive",
      stepIndex: 1,
      variables: {},
      history: [],
    });
  });

  it("clears previous automatic results when rerolling", () => {
    const rerolling = runnerReducer(
      interactiveAt(6, { mode: "vanilla", governor: 3, bonus: [1, 2] }),
      { type: "REROLL" },
    );
    expect(rerolling).toMatchObject({ phase: "randomizing", reroll: true });

    const done = runnerReducer(rerolling, {
      type: "RANDOMIZED",
      values: { governor: 9 },
      cleared: ["governor", "bonus"],
      nextIndex: 6,
    });
    expect(done.variables).toEqual({ mode: "vanilla", governor: 9 });
  });
});

describe("planRandomization", () => {
  it("stops at the next interactive step", () => {
    expect(planRandomization(logic, initialRunnerState())).toEqual({
      automatic: [],
      nextIndex: 0,
    });
  });

  it("collects automatic steps whose conditions pass", () => {
    const plan = planRandomization(logic, {
      ...initialRunnerState(),
      cursor: 3,
      variables: { mode: "vanilla" },
    });

    expect(plan.automatic.map(step => step.label)).toEqual([
      "pawns",
      "firstPlayer",
    ]);
    expect(plan.nextIndex).toBe(6);
  });

  it("replans every automatic step on reroll and stays on the display", () => {
    const plan = planRandomization(logic, {
      ...interactiveAt(6, { mode: "coffee" }),
      reroll: true,
      cursor: 0,
    });

    expect(plan.automatic.map(step => step.label)).toEqual([
      "pawns",
      "bonus",
      "firstPlayer",
    ]);
    expect(plan.nextIndex).toBe(6);
  });
});

describe("automatic steps", () => {
  const context = (api: RandomizerApi) => ({ logic, sets: TEST_SETS, api });

  it("parses dice formulas", () => {
    expect(parseDiceFormula("2d6")).toEqual({ count: 2, sides: 6 });
    expect(parseDiceFormula("d20")).toEqual({ count: 1, sides: 20 });
    expect(() => parseDiceFormula("2x6")).toThrow();
  });

  it("rolls all dice at once and sums them per target", async () => {
    const api = fakeApi();
    const values = await runAutomaticStep(
      logic.steps[3] as never,
      {},
      context(api),
    );

    expect(api.rollDice).toHaveBeenCalledWith(4, 6, undefined);
    expect(values).toEqual({ governor: 3, smuggler: 7 });
  });

  it("deals set item values and single player indices", async () => {
    const api = fakeApi();
    await expect(
      runAutomaticStep(logic.steps[4] as never, {}, context(api)),
    ).resolves.toEqual({ bonus: [1, 2] });
    await expect(
      runAutomaticStep(
        logic.steps[5] as never,
        { PLAYERS: [0, 1] },
        context(api),
      ),
    ).resolves.toEqual({ firstPlayer: 0 });
  });

  it("skips dealing from players when they were skipped", async () => {
    const api = fakeApi();
    await expect(
      runAutomaticStep(logic.steps[5] as never, {}, context(api)),
    ).resolves.toEqual({});
    expect(api.choose).not.toHaveBeenCalled();
  });

  it("refuses to deal more items than available", async () => {
    const step = { ...(logic.steps[4] as object), choose: 5 };
    await expect(
      runAutomaticStep(step as never, {}, context(fakeApi())),
    ).rejects.toThrow('Step "bonus" needs 5 items but only 3 are available');
  });

  it("feeds earlier results into later steps", async () => {
    const api = fakeApi();
    const plan = planRandomization(logic, {
      ...initialRunnerState(),
      cursor: 3,
      variables: { mode: "coffee", PLAYERS: [0, 1, 2] },
    });

    await expect(
      runRandomization(
        plan,
        { mode: "coffee", PLAYERS: [0, 1, 2] },
        context(api),
      ),
    ).resolves.toEqual({
      governor: 3,
      smuggler: 7,
      bonus: [1, 2],
      firstPlayer: 0,
    });
  });
});

describe("conditionPasses", () => {
  it("matches scalar and list variables", () => {
    const step = { ...logic.steps[4], when: { variable: "x", includes: "a" } };
    expect(conditionPasses(step, { x: "a" })).toBe(true);
    expect(conditionPasses(step, { x: ["b", "a"] })).toBe(true);
    expect(conditionPasses(step, { x: "b" })).toBe(false);
    expect(conditionPasses(step, {})).toBe(false);
  });
});
