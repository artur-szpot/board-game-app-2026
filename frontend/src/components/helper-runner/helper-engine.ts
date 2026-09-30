import type { NamedItem, RandomizerApi } from "../../api/randomizer";
import {
    type AutomaticStep,
    type HelperLogic,
    type HelperStep,
    HelperStepSchema,
    type InteractiveStep,
    PLAYERS_VARIABLE,
    type SetDataDto,
    TEAM_VARIABLE,
} from "../../dto/helper-logic.dto";

export type VariableValue = number | number[] | string | string[];
export type Variables = Record<string, VariableValue>;

export type Roster = {
  team: NamedItem;
  players: NamedItem[];
};

type Snapshot = {
  stepIndex: number;
  variables: Variables;
  roster?: Roster;
};

export type RunnerPhase = "randomizing" | "interactive" | "error";

export type RunnerState = {
  phase: RunnerPhase;
  /** First step index the pending randomization starts from. */
  cursor: number;
  stepIndex: number;
  variables: Variables;
  roster?: Roster;
  history: Snapshot[];
  /** Re-run every automatic step instead of only the ones after the cursor. */
  reroll: boolean;
  error?: string;
};

export type StepCompletion = {
  values: Variables;
  unset?: string[];
  roster?: Roster;
};

export type RunnerAction =
  | { type: "COMPLETE_STEP"; completion: StepCompletion }
  | {
      type: "RANDOMIZED";
      values: Variables;
      cleared: string[];
      nextIndex: number;
    }
  | { type: "FAIL"; error: string }
  | { type: "RETRY" }
  | { type: "BACK" }
  | { type: "RESTART" }
  | { type: "REROLL" };

export const initialRunnerState = (): RunnerState => ({
  phase: "randomizing",
  cursor: 0,
  stepIndex: 0,
  variables: {},
  history: [],
  reroll: false,
});

const omit = (variables: Variables, keys: string[]): Variables =>
  Object.fromEntries(
    Object.entries(variables).filter(([key]) => !keys.includes(key)),
  );

export const runnerReducer = (
  state: RunnerState,
  action: RunnerAction,
): RunnerState => {
  switch (action.type) {
    case "COMPLETE_STEP": {
      const { values, unset = [] } = action.completion;
      return {
        ...state,
        phase: "randomizing",
        reroll: false,
        cursor: state.stepIndex + 1,
        variables: { ...omit(state.variables, unset), ...values },
        roster:
          "roster" in action.completion
            ? action.completion.roster
            : state.roster,
        history: [
          ...state.history,
          {
            stepIndex: state.stepIndex,
            variables: state.variables,
            roster: state.roster,
          },
        ],
      };
    }
    case "RANDOMIZED":
      return {
        ...state,
        phase: "interactive",
        reroll: false,
        error: undefined,
        stepIndex: action.nextIndex,
        variables: {
          ...omit(state.variables, action.cleared),
          ...action.values,
        },
      };
    case "FAIL":
      return { ...state, phase: "error", error: action.error };
    case "RETRY":
      return { ...state, phase: "randomizing", error: undefined };
    case "BACK": {
      const previous = state.history.at(-1);
      if (!previous) {
        return state;
      }
      return {
        ...state,
        phase: "interactive",
        error: undefined,
        stepIndex: previous.stepIndex,
        variables: previous.variables,
        roster: previous.roster,
        history: state.history.slice(0, -1),
      };
    }
    case "RESTART":
      return initialRunnerState();
    case "REROLL":
      return { ...state, phase: "randomizing", reroll: true, cursor: 0 };
  }
};

export const isAutomaticStep = (step: HelperStep): step is AutomaticStep =>
  step.schema === HelperStepSchema.ROLL ||
  step.schema === HelperStepSchema.DEAL;

export const conditionPasses = (
  step: HelperStep,
  variables: Variables,
): boolean => {
  if (!step.when) {
    return true;
  }
  const value = variables[step.when.variable];
  return Array.isArray(value)
    ? (value as unknown[]).includes(step.when.includes)
    : value === step.when.includes;
};

export type RandomizationPlan = {
  automatic: AutomaticStep[];
  nextIndex: number;
};

/** Collects the automatic steps to run before the next interactive step. */
export const planRandomization = (
  logic: HelperLogic,
  state: Pick<RunnerState, "cursor" | "reroll" | "variables" | "stepIndex">,
): RandomizationPlan => {
  const automatic: AutomaticStep[] = [];
  const { steps } = logic;
  if (state.reroll) {
    steps.forEach(step => {
      if (isAutomaticStep(step) && conditionPasses(step, state.variables)) {
        automatic.push(step);
      }
    });
    return { automatic, nextIndex: state.stepIndex };
  }
  for (let index = state.cursor; index < steps.length; index++) {
    const step = steps[index];
    if (!conditionPasses(step, state.variables)) {
      continue;
    }
    if (!isAutomaticStep(step)) {
      return { automatic, nextIndex: index };
    }
    automatic.push(step);
  }
  // Validation guarantees a trailing display step, so this is only a safety net.
  return { automatic, nextIndex: steps.length - 1 };
};

export const automaticTargets = (logic: HelperLogic): string[] =>
  logic.steps.flatMap(step => {
    if (step.schema === HelperStepSchema.ROLL) {
      return step.targetVariables;
    }
    if (step.schema === HelperStepSchema.DEAL) {
      return [step.targetVariable];
    }
    return [];
  });

export const parseDiceFormula = (
  formula: string,
): { count: number; sides: number } => {
  const match = /^(\d*)d(\d+)$/.exec(formula);
  if (!match) {
    throw new Error(`Invalid dice formula "${formula}"`);
  }
  return { count: match[1] ? Number(match[1]) : 1, sides: Number(match[2]) };
};

export type RandomizationContext = {
  logic: HelperLogic;
  sets: Record<string, SetDataDto>;
  api: RandomizerApi;
  accessToken?: string;
};

export const runAutomaticStep = async (
  step: AutomaticStep,
  variables: Variables,
  { logic, sets, api, accessToken }: RandomizationContext,
): Promise<Variables> => {
  if (step.schema === HelperStepSchema.ROLL) {
    const { count, sides } = parseDiceFormula(step.formula);
    const rolls = await api.rollDice(
      count * step.targetVariables.length,
      sides,
      accessToken,
    );
    return Object.fromEntries(
      step.targetVariables.map((variable, index) => [
        variable,
        rolls
          .slice(index * count, (index + 1) * count)
          .reduce((sum, roll) => sum + roll, 0),
      ]),
    );
  }

  const set = sets[step.source] as SetDataDto | undefined;
  const items =
    step.source === PLAYERS_VARIABLE
      ? ((variables[PLAYERS_VARIABLE] as number[] | undefined) ?? [])
      : (set?.items.map(item => item.value) ?? []);
  if (items.length === 0) {
    return {};
  }
  if (step.choose > items.length) {
    throw new Error(
      `Step "${step.label}" needs ${step.choose.toString()} items but only ${items.length.toString()} are available`,
    );
  }
  const chosen = await api.choose(items, step.choose, accessToken);
  return {
    [step.targetVariable]:
      logic.variables[step.targetVariable] === "integer" ? chosen[0] : chosen,
  };
};

export const runRandomization = async (
  plan: RandomizationPlan,
  variables: Variables,
  context: RandomizationContext,
): Promise<Variables> => {
  let current = variables;
  const produced: Variables = {};
  for (const step of plan.automatic) {
    const values = await runAutomaticStep(step, current, context);
    Object.assign(produced, values);
    current = { ...current, ...values };
  }
  return produced;
};

export const rosterVariables = (roster: Roster): Variables => ({
  [TEAM_VARIABLE]: 0,
  [PLAYERS_VARIABLE]: roster.players.map((_, index) => index),
});

export const asInteractiveStep = (step: HelperStep | undefined) =>
  step && !isAutomaticStep(step) ? (step as InteractiveStep) : undefined;
