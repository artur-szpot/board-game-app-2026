import { HelperLogic, HelperStepSchema } from './helper-logic.types';

export const buildTestHelperLogic = (): HelperLogic => ({
  schema: 'helper',
  version: '2026.0',
  i18nPrefix: 'helper.game.istanbul',
  variables: {
    mode: 'istanbulMode',
    governorPosition: 'integer',
    smugglerPosition: 'integer',
    firstPlayer: 'integer',
    bonusCards: 'integer[]',
  },
  enums: {
    istanbulMode: ['vanilla', 'coffee', 'letters', 'grandBazaar'],
  },
  sets: {
    bonusCards: 'set-1',
  },
  steps: [
    {
      label: 'choosePlayers',
      schema: HelperStepSchema.TEAM_AND_PLAYERS,
      version: '2026.0',
      minPlayers: 2,
      maxPlayers: 5,
    },
    {
      label: 'gameVariant',
      schema: HelperStepSchema.SINGLE_SELECT,
      version: '2026.0',
      targetVariable: 'mode',
      enum: 'istanbulMode',
    },
    {
      label: 'setBigPawns',
      schema: HelperStepSchema.ROLL,
      version: '2026.0',
      targetVariables: ['governorPosition', 'smugglerPosition'],
      formula: '2d6',
    },
    {
      label: 'dealBonusCards',
      schema: HelperStepSchema.DEAL,
      version: '2026.0',
      when: { variable: 'mode', includes: 'coffee' },
      source: 'bonusCards',
      choose: 2,
      targetVariable: 'bonusCards',
    },
    {
      label: 'chooseFirstPlayer',
      schema: HelperStepSchema.DEAL,
      version: '2026.0',
      source: 'PLAYERS',
      choose: 1,
      targetVariable: 'firstPlayer',
    },
    {
      label: 'summary',
      schema: HelperStepSchema.DISPLAY,
      version: '2026.0',
      elements: [
        {
          type: 'key-value',
          variable: 'firstPlayer',
          label: ['helper.general.firstPlayer'],
        },
        {
          type: 'key-value',
          variable: 'governorPosition',
          label: ['helper.game.istanbul.governor'],
        },
        {
          type: 'key-value',
          variable: 'smugglerPosition',
          label: ['helper.game.istanbul.smuggler'],
        },
        {
          type: 'list',
          variable: 'bonusCards',
          label: ['helper.game.istanbul.bonusCards'],
        },
      ],
    },
  ] as HelperLogic['steps'],
});
