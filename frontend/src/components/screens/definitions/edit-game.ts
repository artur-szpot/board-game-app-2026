import type {
    GameResponseDto,
    HelperResponseDto,
    ScoringSchemaResponseDto,
} from "../../../dto/collection-items.dto";
import { GameLength } from "../../../dto/game-length.enum";
import { formNumber } from "../../forms/FormFieldNumericInput";
import { formOptions } from "../../forms/FormOptionsField";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import type { SelectionResult } from "../selection-strategies";
import {
    GameDataType,
    ResultMappingStrategy,
    selectionStrategyChooseOne,
    selectionStrategySelectAnyNumber,
} from "../selection-strategies";

const toTagSelection = (
  tag: GameResponseDto["tags"][number],
): SelectionResult => ({
  type: GameDataType.TAG,
  value: tag.id,
  name: tag.name,
});

const toLocationSelection = (
  location: GameResponseDto["locations"][number],
): SelectionResult => ({
  type: location.isGameId ? GameDataType.GAME : GameDataType.LOCATION,
  value: location.locationId,
  name: location.path.at(-1)?.name ?? location.locationId,
  additionalStringFields: {
    note: location.note ?? "",
  },
});

const toNamedSelection = (
  type: GameDataType,
  id: string,
  name: string,
): SelectionResult => ({
  type,
  value: id,
  name,
});

const toScoringSchemaSelection = (
  schema: ScoringSchemaResponseDto,
): SelectionResult =>
  toNamedSelection(GameDataType.SCORING_SCHEMA, schema.id, schema.name);

const toHelperSelection = (helper: HelperResponseDto): SelectionResult =>
  toNamedSelection(GameDataType.HELPER, helper.id, helper.name);

export const buildEditGameScreen = (game: GameResponseDto): FormScreenProps => {
  const detailedGame = game as GameResponseDto & {
    scoringSchemas: ScoringSchemaResponseDto[];
    helpers: HelperResponseDto[];
  };

  return {
    method: "PATCH",
    action: `game-api/games/${game.id}`,
    title: `Edit ${game.name}`,
    fields: [
      formText({
        name: "name",
        label: "Game name",
        required: true,
        initialValue: game.name,
      }),
      formText({
        name: "description",
        label: "Description",
        initialValue: game.description ?? "",
      }),
      formNumber({
        name: "minPlayers",
        label: "Minimum players",
        initialValue: game.minPlayers,
        min: 1,
        max: 99,
      }),
      formNumber({
        name: "maxPlayers",
        label: "Maximum players",
        initialValue: game.maxPlayers,
        min: 1,
        max: 99,
      }),
      formOptions({
        name: "length",
        label: "Game length",
        resultMapping: ResultMappingStrategy.SINGLE_VALUE_ONLY,
        params: {
          dataType: GameDataType.OTHER,
          strategy: selectionStrategyChooseOne(),
          title: "Game length",
          options: [
            GameLength.FILLER,
            GameLength.SHORT,
            GameLength.MEDIUM,
            GameLength.LONG,
          ].map(length => ({
            value: length,
            label: length,
            chosen: length === game.length,
          })),
        },
      }),
      formSearch({
        name: "tagIds",
        label: "Tags",
        resultMapping: ResultMappingStrategy.VALUES_ONLY,
        params: {
          dataTypes: [GameDataType.TAG],
          strategy: selectionStrategySelectAnyNumber(),
          title: "Tags",
          currentSelection: game.tags.map(toTagSelection),
        },
      }),
      formSearch({
        name: "locations",
        label: "Location(s)",
        resultMapping: ResultMappingStrategy.CUSTOM,
        customMapping: item => ({
          locationId: item.value,
          isGameId: item.type === GameDataType.GAME,
          ...(item.additionalStringFields?.note && {
            note: item.additionalStringFields.note,
          }),
        }),
        params: {
          dataTypes: [GameDataType.LOCATION, GameDataType.GAME],
          strategy: selectionStrategySelectAnyNumber(),
          title: "Location(s)",
          additionalFields: [
            formText({
              name: "note",
              label: "Note",
            }),
          ],
          currentSelection: game.locations.map(toLocationSelection),
        },
      }),
      formSearch({
        name: "scoringSchemaIds",
        label: "Scoring schemas",
        resultMapping: ResultMappingStrategy.VALUES_ONLY,
        params: {
          dataTypes: [GameDataType.SCORING_SCHEMA],
          strategy: selectionStrategySelectAnyNumber(),
          title: "Scoring schemas",
          currentSelection: detailedGame.scoringSchemas.map(
            toScoringSchemaSelection,
          ),
        },
      }),
      formSearch({
        name: "helperIds",
        label: "Helpers",
        resultMapping: ResultMappingStrategy.VALUES_ONLY,
        params: {
          dataTypes: [GameDataType.HELPER],
          strategy: selectionStrategySelectAnyNumber(),
          title: "Helpers",
          currentSelection: detailedGame.helpers.map(toHelperSelection),
        },
      }),
    ],
  };
};
