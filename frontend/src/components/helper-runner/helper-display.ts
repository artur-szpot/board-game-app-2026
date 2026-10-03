import {
  type HelperLogic,
  HelperStepSchema,
  PLAYERS_VARIABLE,
  type RunnerSetDto,
  TEAM_VARIABLE,
} from "../../dto/helper-logic.dto";
import type { Roster, VariableValue } from "./helper-engine";
import { enumLabelKey, type Translate } from "./helper-i18n";
import { setItemTranslationKey } from "../../utils/set-data";

export type DisplayContext = {
  logic: HelperLogic;
  sets: Record<string, RunnerSetDto>;
  roster?: Roster;
  translate: Translate;
};

const dealSourceOf = (logic: HelperLogic, variable: string) => {
  if (variable === PLAYERS_VARIABLE) {
    return PLAYERS_VARIABLE;
  }
  let source: string | undefined;
  logic.steps.forEach(step => {
    if (
      step.schema === HelperStepSchema.DEAL &&
      step.targetVariable === variable
    ) {
      source = step.source;
    }
  });
  return source;
};

const formatSingle = (
  variable: string,
  value: string | number,
  { logic, sets, roster, translate }: DisplayContext,
): string => {
  if (variable === TEAM_VARIABLE) {
    return roster?.team.name ?? String(value);
  }
  const source = dealSourceOf(logic, variable);
  if (source === PLAYERS_VARIABLE) {
    const player = roster?.players[value as number];
    return player?.name ?? String(value);
  }
  if (source) {
    const set = sets[source] as RunnerSetDto | undefined;
    const item = typeof value === "number" ? set?.items[value] : undefined;
    return item && set
      ? translate(setItemTranslationKey(set.name, item.name))
      : String(value);
  }
  const type = logic.variables[variable] as string | undefined;
  const enumName = type?.replace(/\[\]$/, "");
  if (enumName && enumName in logic.enums) {
    return translate(enumLabelKey(logic, enumName, String(value)));
  }
  return String(value);
};

/** Returns display strings for a variable, or undefined when it was never set. */
export const formatVariable = (
  variable: string,
  value: VariableValue | undefined,
  context: DisplayContext,
): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const values: (string | number)[] = Array.isArray(value) ? value : [value];
  return values.map(entry => formatSingle(variable, entry, context));
};
