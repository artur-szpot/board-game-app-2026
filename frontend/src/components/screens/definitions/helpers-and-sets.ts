import type {
    HelperResponseDto,
    SetResponseDto,
} from "../../../dto/collection-items.dto";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";

const HELPER_LOGIC_TEMPLATE = {
  schema: "helper",
  version: "2026.0",
  i18nPrefix: "helper.game.example",
  variables: { firstPlayer: "integer" },
  enums: {},
  sets: {},
  steps: [
    {
      label: "choosePlayers",
      schema: "team-and-players",
      version: "2026.0",
      minPlayers: 2,
      maxPlayers: 4,
    },
    {
      label: "chooseFirstPlayer",
      schema: "deal",
      version: "2026.0",
      source: "PLAYERS",
      choose: 1,
      targetVariable: "firstPlayer",
    },
    {
      label: "summary",
      schema: "display",
      version: "2026.0",
      elements: [
        {
          type: "key-value",
          variable: "firstPlayer",
          label: ["helper.general.firstPlayer"],
        },
      ],
    },
  ],
};

const SET_DATA_TEMPLATE = {
  items: [
    { value: 1, label: ["helper.game.example.item", { n: 1 }] },
    { value: 2, label: ["helper.game.example.item", { n: 2 }] },
  ],
};

const toJson = (value: object) => JSON.stringify(value, null, 2);

const nameField = (label: string, initialValue?: string) =>
  formText({ name: "name", label, required: true, initialValue });

const jsonField = (name: string, label: string, value: object) =>
  formText({
    name,
    label,
    required: true,
    multiline: true,
    json: true,
    initialValue: toJson(value),
  });

export const createHelperScreen: FormScreenProps = {
  method: "POST",
  action: "game-api/helpers",
  title: "Add a new helper",
  fields: [
    nameField("Helper name"),
    jsonField("logic", "Helper logic (JSON)", HELPER_LOGIC_TEMPLATE),
  ],
};

export const buildEditHelperScreen = (
  helper: HelperResponseDto,
): FormScreenProps => ({
  method: "PUT",
  action: `game-api/helpers/${helper.id}`,
  title: `Edit ${helper.name}`,
  fields: [
    nameField("Helper name", helper.name),
    jsonField("logic", "Helper logic (JSON)", helper.logic),
  ],
});

export const createSetScreen: FormScreenProps = {
  method: "POST",
  action: "game-api/sets",
  title: "Add a new set",
  fields: [
    nameField("Set name"),
    jsonField("data", "Set items (JSON)", SET_DATA_TEMPLATE),
  ],
};

export const buildEditSetScreen = (set: SetResponseDto): FormScreenProps => ({
  method: "PUT",
  action: `game-api/sets/${set.id}`,
  title: `Edit ${set.name}`,
  fields: [
    nameField("Set name", set.name),
    jsonField("data", "Set items (JSON)", set.data),
  ],
});
