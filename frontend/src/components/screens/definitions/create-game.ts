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

export const createGameScreen: FormScreenProps = {
  method: "POST",
  action: "game-api/games",
  title: "Add a new game",
  fields: [
    formText({
      name: "name",
      label: "Game name",
      required: true,
    }),
    formText({
      name: "description",
      label: "Description",
    }),
    formNumber({
      name: "minPlayers",
      label: "Minimum players",
      initialValue: 2,
      min: 1,
      max: 99,
    }),
    formNumber({
      name: "maxPlayers",
      label: "Maximum players",
      initialValue: 4,
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
        // TODO: add a mapper from enum to words for game length
        options: [
          GameLength.FILLER,
          GameLength.SHORT,
          GameLength.MEDIUM,
          GameLength.LONG,
        ].map(length => ({ value: length, label: length })),
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
      },
    }),
    formSearch({
      name: "locations",
      label: "Location(s)",
      resultMapping: ResultMappingStrategy.CUSTOM,
      customMapping: (item: SelectionResult) => ({
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
      },
    }),
    // TODO: allow to create sought for data types
    formSearch({
      name: "scoringSchemaIds",
      label: "Scoring schemas",
      resultMapping: ResultMappingStrategy.VALUES_ONLY,
      params: {
        dataTypes: [GameDataType.SCORING_SCHEMA],
        strategy: selectionStrategySelectAnyNumber(),
        title: "Scoring schemas",
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
      },
    }),
  ],
};
