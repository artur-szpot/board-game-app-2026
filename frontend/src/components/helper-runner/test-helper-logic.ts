import {
    DisplayElementType,
    type HelperLogic,
    HelperStepSchema,
    type SetDataDto,
} from "../../dto/helper-logic.dto";

export const buildTestHelperLogic = (): HelperLogic => ({
  schema: "helper",
  version: "2026.0",
  i18nPrefix: "helper.game.test",
  variables: {
    mode: "testMode",
    expansions: "testExpansion[]",
    governor: "integer",
    smuggler: "integer",
    bonus: "integer[]",
    firstPlayer: "integer",
  },
  enums: {
    testMode: ["vanilla", "coffee"],
    testExpansion: ["north", "south"],
  },
  sets: { bonusCards: "set-1" },
  steps: [
    {
      label: "choosePlayers",
      schema: HelperStepSchema.TEAM_AND_PLAYERS,
      version: "2026.0",
      allowSkip: true,
      minPlayers: 2,
      maxPlayers: 3,
    },
    {
      label: "mode",
      schema: HelperStepSchema.SINGLE_SELECT,
      version: "2026.0",
      targetVariable: "mode",
      enum: "testMode",
    },
    {
      label: "expansions",
      schema: HelperStepSchema.MULTI_SELECT,
      version: "2026.0",
      targetVariable: "expansions",
      enum: "testExpansion",
      min: 1,
    },
    {
      label: "pawns",
      schema: HelperStepSchema.ROLL,
      version: "2026.0",
      targetVariables: ["governor", "smuggler"],
      formula: "2d6",
    },
    {
      label: "bonus",
      schema: HelperStepSchema.DEAL,
      version: "2026.0",
      when: { variable: "mode", includes: "coffee" },
      source: "bonusCards",
      choose: 2,
      targetVariable: "bonus",
    },
    {
      label: "firstPlayer",
      schema: HelperStepSchema.DEAL,
      version: "2026.0",
      source: "PLAYERS",
      choose: 1,
      targetVariable: "firstPlayer",
    },
    {
      label: "summary",
      schema: HelperStepSchema.DISPLAY,
      version: "2026.0",
      elements: [
        {
          type: DisplayElementType.KEY_VALUE,
          variable: "firstPlayer",
          label: ["helper.general.firstPlayer"],
        },
        {
          type: DisplayElementType.KEY_VALUE,
          variable: "mode",
          label: ["helper.game.test.mode"],
        },
        {
          type: DisplayElementType.KEY_VALUE,
          variable: "governor",
          label: ["helper.game.test.governor"],
        },
        {
          type: DisplayElementType.LIST,
          variable: "bonus",
          label: ["helper.game.test.bonus"],
        },
      ],
    },
  ],
});

export const TEST_SETS: Record<string, SetDataDto> = {
  bonusCards: {
    items: [
      { value: 1, label: ["helper.game.test.card", { n: 1 }] },
      { value: 2, label: ["helper.game.test.card", { n: 2 }] },
      { value: 3, label: ["helper.game.test.card", { n: 3 }] },
    ],
  },
};
