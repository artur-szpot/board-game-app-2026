export const PLAYERS_VARIABLE = "PLAYERS";
export const TEAM_VARIABLE = "TEAM";

export type LabelParams = Record<string, string | number>;
export type LabelTuple = [string] | [string, LabelParams];

export enum HelperStepSchema {
  TEAM_AND_PLAYERS = "team-and-players",
  SINGLE_SELECT = "single-select",
  MULTI_SELECT = "multi-select",
  ROLL = "roll",
  DEAL = "deal",
  DISPLAY = "display",
}

export enum DisplayElementType {
  KEY_VALUE = "key-value",
  LIST = "list",
}

export type StepCondition = {
  variable: string;
  includes: string;
};

type BaseStep = {
  label: string;
  version: string;
  allowSkip?: boolean;
  when?: StepCondition;
  prompt?: LabelTuple;
};

export type TeamAndPlayersStep = BaseStep & {
  schema: HelperStepSchema.TEAM_AND_PLAYERS;
  minPlayers: number;
  maxPlayers: number;
};

export type SingleSelectStep = BaseStep & {
  schema: HelperStepSchema.SINGLE_SELECT;
  targetVariable: string;
  enum: string;
};

export type MultiSelectStep = BaseStep & {
  schema: HelperStepSchema.MULTI_SELECT;
  targetVariable: string;
  enum: string;
  min?: number;
  max?: number;
};

export type RollStep = BaseStep & {
  schema: HelperStepSchema.ROLL;
  targetVariables: string[];
  formula: string;
};

export type DealStep = BaseStep & {
  schema: HelperStepSchema.DEAL;
  source: string;
  choose: number;
  targetVariable: string;
};

export type DisplayElement = {
  type: DisplayElementType;
  variable: string;
  label: LabelTuple;
};

export type DisplayStep = BaseStep & {
  schema: HelperStepSchema.DISPLAY;
  elements: DisplayElement[];
};

export type InteractiveStep =
  | TeamAndPlayersStep
  | SingleSelectStep
  | MultiSelectStep
  | DisplayStep;

export type AutomaticStep = RollStep | DealStep;

export type HelperStep = InteractiveStep | AutomaticStep;

export type HelperLogic = {
  schema: "helper";
  version: string;
  i18nPrefix: string;
  variables: Record<string, string>;
  enums: Record<string, string[]>;
  sets: Record<string, string>;
  steps: HelperStep[];
};

export type SetItemDto = {
  value: number;
  label: LabelTuple;
};

export type SetDataDto = {
  items: SetItemDto[];
};
