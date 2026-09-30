import { HelperStepSchema } from './helper-logic.types';
import {
    getReferencedSetIds,
    validateHelperLogic,
} from './helper-logic.validator';
import { buildTestHelperLogic } from './test-helper-logic.fixture';

describe('validateHelperLogic', () => {
  it('accepts the reference helper', () => {
    expect(validateHelperLogic(buildTestHelperLogic())).toEqual([]);
  });

  it('rejects non-objects and wrong headers', () => {
    expect(validateHelperLogic('nope')).toEqual(['logic must be an object']);
    const logic = { ...buildTestHelperLogic(), schema: 'x', version: '1' };
    expect(validateHelperLogic(logic)).toEqual(
      expect.arrayContaining([
        'logic.schema must be "helper"',
        'logic.version must be "2026.0"',
      ]),
    );
  });

  it('rejects redefining reserved variables', () => {
    const logic = buildTestHelperLogic();
    logic.variables.PLAYERS = 'integer';
    expect(validateHelperLogic(logic)).toContain(
      'logic.variables.PLAYERS: "PLAYERS" is reserved and cannot be redefined',
    );
  });

  it('reports unused variables, enums and sets', () => {
    const logic = buildTestHelperLogic();
    logic.variables.unused = 'integer';
    logic.enums.unusedEnum = ['a'];
    logic.sets.unusedSet = 'set-2';
    expect(validateHelperLogic(logic)).toEqual(
      expect.arrayContaining([
        'variable "unused" is never set by any step',
        'enum "unusedEnum" is not used by any variable',
        'set "unusedSet" is not used by any step',
      ]),
    );
  });

  it('requires unique step labels and a trailing display step', () => {
    const logic = buildTestHelperLogic();
    logic.steps[1].label = 'choosePlayers';
    logic.steps.push({ ...logic.steps[0], label: 'late' });
    const errors = validateHelperLogic(logic);
    expect(errors).toContain(
      'logic.steps[1].label "choosePlayers" is not unique',
    );
    expect(errors).toContain('logic.steps[5]: display must be the last step');
    expect(errors).toContain(
      'logic.steps[6]: the last step must be a display step',
    );
  });

  it('checks target variable types and dice formulas', () => {
    const logic = buildTestHelperLogic();
    const roll = logic.steps[2] as {
      formula: string;
      targetVariables: string[];
    };
    roll.formula = '2x6';
    roll.targetVariables = ['mode'];
    const errors = validateHelperLogic(logic);
    expect(errors).toContain(
      'logic.steps[2].formula must look like "2d6" or "d20"',
    );
    expect(errors).toContain(
      'logic.steps[2].targetVariables[0]: variable "mode" must be of type "integer"',
    );
  });

  it('validates conditions against enum values and step order', () => {
    const logic = buildTestHelperLogic();
    logic.steps[3].when = { variable: 'mode', includes: 'tea' };
    logic.steps[1].when = { variable: 'mode', includes: 'coffee' };
    const errors = validateHelperLogic(logic);
    expect(errors).toContain(
      'logic.steps[3].when.includes must be a value of enum "istanbulMode"',
    );
    expect(errors).toContain(
      'logic.steps[1].when.variable must be set by an earlier step',
    );
  });

  it('requires a team-and-players step before dealing from PLAYERS', () => {
    const logic = buildTestHelperLogic();
    logic.steps.shift();
    expect(validateHelperLogic(logic)).toContain(
      'logic.steps[3].source "PLAYERS" requires an earlier team-and-players step',
    );
  });

  it('matches display element types to variable shapes', () => {
    const logic = buildTestHelperLogic();
    const display = logic.steps[5] as { elements: { type: string }[] };
    display.elements[0].type = 'list';
    display.elements[3].type = 'key-value';
    const errors = validateHelperLogic(logic);
    expect(errors).toContain(
      'logic.steps[5].elements[0]: list elements need a list variable',
    );
    expect(errors).toContain(
      'logic.steps[5].elements[3]: key-value elements need a single value',
    );
  });

  it('rejects unknown step schemas', () => {
    const logic = buildTestHelperLogic();
    (logic.steps[1] as { schema: string }).schema = 'spread';
    expect(validateHelperLogic(logic)).toContain(
      `logic.steps[1].schema must be one of: ${Object.values(HelperStepSchema).join(', ')}`,
    );
  });

  it('lists referenced set IDs once', () => {
    const logic = buildTestHelperLogic();
    logic.sets.again = 'set-1';
    expect(getReferencedSetIds(logic)).toEqual(['set-1']);
  });
});
