import {
    DisplayElementType,
    HELPER_LOGIC_SCHEMA,
    HELPER_LOGIC_VERSION,
    HelperLogic,
    HelperStepSchema,
    INTEGER_LIST_TYPE,
    INTEGER_TYPE,
    PLAYERS_SOURCE,
    RESERVED_VARIABLES,
} from './helper-logic.types';

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const ENUM_VALUE = /^[a-zA-Z][a-zA-Z0-9]*$/;
const DICE_FORMULA = /^(\d*)d(\d+)$/;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isInt = (value: unknown): value is number => Number.isInteger(value);

const isReserved = (name: string): boolean =>
  (RESERVED_VARIABLES as readonly string[]).includes(name);

export const isLabelTuple = (value: unknown): boolean => {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) {
    return false;
  }
  if (!isNonEmptyString(value[0])) {
    return false;
  }
  if (value.length === 2) {
    return (
      isObject(value[1]) &&
      Object.values(value[1]).every(
        (param) => typeof param === 'string' || typeof param === 'number',
      )
    );
  }
  return true;
};

const RESERVED_TYPES: Record<string, string> = {
  TEAM: INTEGER_TYPE,
  PLAYERS: INTEGER_LIST_TYPE,
};

class HelperLogicValidator {
  private readonly errors: string[] = [];
  private readonly variables: Record<string, string> = {};
  private readonly enums: Record<string, string[]> = {};
  private readonly sets: Record<string, string> = {};
  private readonly targetedVariables = new Set<string>();
  private readonly usedSets = new Set<string>();
  private hasTeamAndPlayersStep = false;

  constructor(private readonly logic: unknown) {}

  private error(message: string) {
    this.errors.push(message);
  }

  private typeOf(variable: string): string | undefined {
    return RESERVED_TYPES[variable] ?? this.variables[variable];
  }

  private enumOf(variable: string): string | undefined {
    const type = this.variables[variable];
    if (!type) {
      return undefined;
    }
    const enumName = type.endsWith('[]') ? type.slice(0, -2) : type;
    return this.enums[enumName] ? enumName : undefined;
  }

  public validate(): string[] {
    const logic = this.logic;
    if (!isObject(logic)) {
      return ['logic must be an object'];
    }
    if (logic.schema !== HELPER_LOGIC_SCHEMA) {
      this.error(`logic.schema must be "${HELPER_LOGIC_SCHEMA}"`);
    }
    if (logic.version !== HELPER_LOGIC_VERSION) {
      this.error(`logic.version must be "${HELPER_LOGIC_VERSION}"`);
    }
    if (!isNonEmptyString(logic.i18nPrefix)) {
      this.error('logic.i18nPrefix must be a non-empty string');
    }

    this.validateEnums(logic.enums);
    this.validateVariables(logic.variables);
    this.validateSets(logic.sets);
    this.validateSteps(logic.steps);
    this.validateUsage();

    return this.errors;
  }

  private validateEnums(enums: unknown) {
    if (!isObject(enums)) {
      this.error('logic.enums must be an object');
      return;
    }
    for (const [name, values] of Object.entries(enums)) {
      const path = `logic.enums.${name}`;
      if (!CAMEL_CASE.test(name)) {
        this.error(`${path}: enum names must be camelCase`);
      }
      if (
        !Array.isArray(values) ||
        values.length === 0 ||
        !values.every((value) => typeof value === 'string')
      ) {
        this.error(`${path} must be a non-empty array of strings`);
        continue;
      }
      if (!values.every((value: string) => ENUM_VALUE.test(value))) {
        this.error(`${path}: values must be alphanumeric identifiers`);
      }
      if (new Set(values).size !== values.length) {
        this.error(`${path}: values must be unique`);
      }
      this.enums[name] = values as string[];
    }
  }

  private validateVariables(variables: unknown) {
    if (!isObject(variables)) {
      this.error('logic.variables must be an object');
      return;
    }
    for (const [name, type] of Object.entries(variables)) {
      const path = `logic.variables.${name}`;
      if (isReserved(name)) {
        this.error(`${path}: "${name}" is reserved and cannot be redefined`);
        continue;
      }
      if (!CAMEL_CASE.test(name)) {
        this.error(`${path}: variable names must be camelCase`);
      }
      if (typeof type !== 'string') {
        this.error(`${path} must be a type name`);
        continue;
      }
      const baseType = type.endsWith('[]') ? type.slice(0, -2) : type;
      if (baseType !== INTEGER_TYPE && !this.enums[baseType]) {
        this.error(
          `${path}: type "${type}" must be integer, integer[], a defined enum or a defined enum list`,
        );
        continue;
      }
      this.variables[name] = type;
    }
  }

  private validateSets(sets: unknown) {
    if (!isObject(sets)) {
      this.error('logic.sets must be an object');
      return;
    }
    for (const [alias, setId] of Object.entries(sets)) {
      const path = `logic.sets.${alias}`;
      if (!CAMEL_CASE.test(alias)) {
        this.error(`${path}: set aliases must be camelCase`);
      }
      if (!isNonEmptyString(setId)) {
        this.error(`${path} must be a set ID`);
        continue;
      }
      this.sets[alias] = setId;
    }
  }

  private validateSteps(steps: unknown) {
    if (!Array.isArray(steps) || steps.length === 0) {
      this.error('logic.steps must be a non-empty array');
      return;
    }
    const labels = new Set<string>();
    steps.forEach((step, index) => {
      const path = `logic.steps[${index}]`;
      if (!isObject(step)) {
        this.error(`${path} must be an object`);
        return;
      }
      if (!isNonEmptyString(step.label)) {
        this.error(`${path}.label must be a non-empty string`);
      } else if (labels.has(step.label)) {
        this.error(`${path}.label "${step.label}" is not unique`);
      } else {
        labels.add(step.label);
      }
      if (step.version !== HELPER_LOGIC_VERSION) {
        this.error(`${path}.version must be "${HELPER_LOGIC_VERSION}"`);
      }
      if (step.allowSkip !== undefined && typeof step.allowSkip !== 'boolean') {
        this.error(`${path}.allowSkip must be a boolean`);
      }
      if (step.prompt !== undefined && !isLabelTuple(step.prompt)) {
        this.error(`${path}.prompt must be a label tuple`);
      }
      if (step.when !== undefined) {
        this.validateCondition(step.when, `${path}.when`);
      }

      const isLast = index === steps.length - 1;
      if (step.schema === HelperStepSchema.DISPLAY && !isLast) {
        this.error(`${path}: display must be the last step`);
      }
      if (isLast && step.schema !== HelperStepSchema.DISPLAY) {
        this.error(`${path}: the last step must be a display step`);
      }

      this.validateStep(step, path);
    });
  }

  private validateCondition(when: unknown, path: string) {
    if (!isObject(when)) {
      this.error(`${path} must be an object`);
      return;
    }
    if (typeof when.variable !== 'string' || !this.variables[when.variable]) {
      this.error(`${path}.variable must reference a defined variable`);
      return;
    }
    if (!this.targetedVariables.has(when.variable)) {
      this.error(`${path}.variable must be set by an earlier step`);
    }
    const enumName = this.enumOf(when.variable);
    if (!enumName) {
      this.error(`${path}.variable must be of an enum type`);
      return;
    }
    if (
      typeof when.includes !== 'string' ||
      !this.enums[enumName].includes(when.includes)
    ) {
      this.error(`${path}.includes must be a value of enum "${enumName}"`);
    }
  }

  private target(variable: unknown, expectedType: string, path: string) {
    if (typeof variable !== 'string' || !this.variables[variable]) {
      this.error(`${path} must reference a defined variable`);
      return;
    }
    if (this.variables[variable] !== expectedType) {
      this.error(
        `${path}: variable "${variable}" must be of type "${expectedType}"`,
      );
    }
    this.targetedVariables.add(variable);
  }

  private validateStep(step: Json, path: string) {
    switch (step.schema) {
      case HelperStepSchema.TEAM_AND_PLAYERS: {
        if (this.hasTeamAndPlayersStep) {
          this.error(`${path}: only one team-and-players step is allowed`);
        }
        this.hasTeamAndPlayersStep = true;
        const { minPlayers, maxPlayers } = step;
        if (!isInt(minPlayers) || minPlayers < 1) {
          this.error(`${path}.minPlayers must be a positive integer`);
        }
        if (!isInt(maxPlayers) || maxPlayers < 1) {
          this.error(`${path}.maxPlayers must be a positive integer`);
        }
        if (isInt(minPlayers) && isInt(maxPlayers) && minPlayers > maxPlayers) {
          this.error(`${path}: minPlayers cannot exceed maxPlayers`);
        }
        return;
      }
      case HelperStepSchema.SINGLE_SELECT:
      case HelperStepSchema.MULTI_SELECT: {
        const isMulti = step.schema === HelperStepSchema.MULTI_SELECT;
        if (typeof step.enum !== 'string' || !this.enums[step.enum]) {
          this.error(`${path}.enum must reference a defined enum`);
          return;
        }
        this.target(
          step.targetVariable,
          isMulti ? `${step.enum}[]` : step.enum,
          `${path}.targetVariable`,
        );
        if (isMulti) {
          this.validateMultiSelectBounds(step, this.enums[step.enum], path);
        }
        return;
      }
      case HelperStepSchema.ROLL: {
        const { targetVariables, formula } = step;
        if (!Array.isArray(targetVariables) || targetVariables.length === 0) {
          this.error(`${path}.targetVariables must be a non-empty array`);
        } else {
          targetVariables.forEach((variable, index) =>
            this.target(
              variable,
              INTEGER_TYPE,
              `${path}.targetVariables[${index}]`,
            ),
          );
        }
        const match = typeof formula === 'string' && DICE_FORMULA.exec(formula);
        if (
          !match ||
          (match[1] !== '' && Number(match[1]) < 1) ||
          Number(match[2]) < 2
        ) {
          this.error(`${path}.formula must look like "2d6" or "d20"`);
        }
        return;
      }
      case HelperStepSchema.DEAL: {
        const { source, choose } = step;
        if (source === PLAYERS_SOURCE) {
          if (!this.hasTeamAndPlayersStep) {
            this.error(
              `${path}.source "PLAYERS" requires an earlier team-and-players step`,
            );
          }
        } else if (typeof source !== 'string' || !this.sets[source]) {
          this.error(`${path}.source must be "PLAYERS" or a defined set alias`);
        } else {
          this.usedSets.add(source);
        }
        if (!isInt(choose) || choose < 1) {
          this.error(`${path}.choose must be a positive integer`);
        }
        const variableType =
          typeof step.targetVariable === 'string'
            ? this.variables[step.targetVariable]
            : undefined;
        if (variableType === INTEGER_TYPE && choose !== 1) {
          this.error(
            `${path}.targetVariable of type "integer" requires choose to be 1`,
          );
        }
        this.target(
          step.targetVariable,
          variableType === INTEGER_TYPE ? INTEGER_TYPE : INTEGER_LIST_TYPE,
          `${path}.targetVariable`,
        );
        return;
      }
      case HelperStepSchema.DISPLAY:
        this.validateDisplay(step, path);
        return;
      default:
        this.error(
          `${path}.schema must be one of: ${Object.values(HelperStepSchema).join(', ')}`,
        );
    }
  }

  private validateMultiSelectBounds(
    step: Json,
    values: string[],
    path: string,
  ) {
    const { min, max } = step;
    if (min !== undefined && (!isInt(min) || min < 0)) {
      this.error(`${path}.min must be a non-negative integer`);
    }
    if (max !== undefined && (!isInt(max) || max < 1 || max > values.length)) {
      this.error(`${path}.max must be between 1 and the enum size`);
    }
    if (isInt(min) && isInt(max) && min > max) {
      this.error(`${path}: min cannot exceed max`);
    }
  }

  private validateDisplay(step: Json, path: string) {
    const { elements } = step;
    if (!Array.isArray(elements) || elements.length === 0) {
      this.error(`${path}.elements must be a non-empty array`);
      return;
    }
    elements.forEach((element, index) => {
      const elementPath = `${path}.elements[${index}]`;
      if (!isObject(element)) {
        this.error(`${elementPath} must be an object`);
        return;
      }
      if (!isLabelTuple(element.label)) {
        this.error(`${elementPath}.label must be a label tuple`);
      }
      const variable = element.variable;
      const type = typeof variable === 'string' ? this.typeOf(variable) : '';
      if (!type) {
        this.error(`${elementPath}.variable must reference a defined variable`);
        return;
      }
      if (
        !isReserved(variable as string) &&
        !this.targetedVariables.has(variable as string)
      ) {
        this.error(`${elementPath}.variable must be set by an earlier step`);
      }
      const isList = type.endsWith('[]');
      if (
        !Object.values(DisplayElementType).includes(
          element.type as DisplayElementType,
        )
      ) {
        this.error(
          `${elementPath}.type must be one of: ${Object.values(DisplayElementType).join(', ')}`,
        );
      } else if (element.type === DisplayElementType.KEY_VALUE && isList) {
        this.error(`${elementPath}: key-value elements need a single value`);
      } else if (element.type === DisplayElementType.LIST && !isList) {
        this.error(`${elementPath}: list elements need a list variable`);
      }
    });
  }

  private validateUsage() {
    for (const variable of Object.keys(this.variables)) {
      if (!this.targetedVariables.has(variable)) {
        this.error(`variable "${variable}" is never set by any step`);
      }
    }
    const usedEnums = new Set(
      Object.values(this.variables).map((type) => type.replace(/\[\]$/, '')),
    );
    for (const enumName of Object.keys(this.enums)) {
      if (!usedEnums.has(enumName)) {
        this.error(`enum "${enumName}" is not used by any variable`);
      }
    }
    for (const alias of Object.keys(this.sets)) {
      if (!this.usedSets.has(alias)) {
        this.error(`set "${alias}" is not used by any step`);
      }
    }
  }
}

export const validateHelperLogic = (logic: unknown): string[] =>
  new HelperLogicValidator(logic).validate();

export const getReferencedSetIds = (logic: HelperLogic): string[] => [
  ...new Set(Object.values(logic.sets ?? {})),
];
