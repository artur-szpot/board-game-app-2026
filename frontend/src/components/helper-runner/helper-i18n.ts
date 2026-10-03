import {
  type HelperLogic,
  HelperStepSchema,
  type LabelParams,
  type LabelTuple,
  type RunnerSetDto,
} from "../../dto/helper-logic.dto";
import { setItemTranslationKey } from "../../utils/set-data";

export const UI_DEFAULTS = {
  "helper.ui.chooseTeam": "Choose a team",
  "helper.ui.choosePlayers": "Choose players",
  "helper.ui.chooseOption": "Choose one option",
  "helper.ui.chooseOptions": "Choose options",
  "helper.ui.ok": "OK",
  "helper.ui.skip": "Skip",
  "helper.ui.back": "Back",
  "helper.ui.restart": "Restart",
  "helper.ui.reroll": "Reroll",
  "helper.ui.tooFew": "Choose at least {{min}}",
  "helper.ui.tooMany": "Choose at most {{max}}",
  "helper.ui.randomizing": "Randomizing…",
} as const;

export type UiKey = keyof typeof UI_DEFAULTS;

export const enumLabelKey = (
  logic: HelperLogic,
  enumName: string,
  value: string,
): string => `${logic.i18nPrefix}.enum.${enumName}.${value}`;

export const collectLabelKeys = (
  logic: HelperLogic,
  sets: Record<string, RunnerSetDto>,
): string[] => {
  const keys = new Set<string>(Object.keys(UI_DEFAULTS));
  logic.steps.forEach(step => {
    if (step.prompt) {
      keys.add(step.prompt[0]);
    }
    if (step.schema === HelperStepSchema.DISPLAY) {
      step.elements.forEach(element => keys.add(element.label[0]));
    }
  });
  Object.entries(logic.enums).forEach(([enumName, values]) =>
    values.forEach(value => keys.add(enumLabelKey(logic, enumName, value))),
  );
  Object.values(sets).forEach(set =>
    set.items.forEach(item =>
      keys.add(setItemTranslationKey(set.name, item.name)),
    ),
  );
  return [...keys];
};

export const interpolate = (template: string, params?: LabelParams): string =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) =>
    params && name in params ? String(params[name]) : placeholder,
  );

export type Translate = (label: LabelTuple | string) => string;

export const buildTranslate =
  (translations: Record<string, string>): Translate =>
  label => {
    const [key, params] = typeof label === "string" ? [label] : label;
    const template =
      (translations[key] as string | undefined) ??
      (UI_DEFAULTS as Record<string, string | undefined>)[key];
    if (template !== undefined) {
      return interpolate(template, params);
    }
    return params ? `${key} ${JSON.stringify(params)}` : key;
  };
