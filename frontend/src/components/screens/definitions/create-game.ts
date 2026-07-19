import { GameLength } from "../../../dto/game-length.enum";
import type { FrameStackDto } from "../../../store/features/frameStackSlice";
import { formCheckbox } from "../../forms/FormCheckboxField";
import { formOptions } from "../../forms/FormOptionsField";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
  GameDataType,
  ResultMappingStrategy,
  selectionStrategyChooseOne,
  selectionStrategySelectAnyNumber,
  selectionStrategySelectNumber,
} from "../selection-strategies";

// tagIds?: string[];
// locationIds?: string[];
// scoringSchemaIds?: string[];
// helperIds?: string[];

export const createGameScreen: FrameStackDto<FormScreenProps> = {
  params: {
    method: "POST",
    action: "game-api/games",
    title: "Add new game",
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
        name: "locationIds",
        label: "Tags",
        resultMapping: ResultMappingStrategy.VALUES_ONLY,
        params: {
          dataTypes: [GameDataType.TAG],
          strategy: selectionStrategySelectAnyNumber(),
          title: "Tags",
        },
      }),
      // TODO: allow to create sought for data types
    ],
  },
};
