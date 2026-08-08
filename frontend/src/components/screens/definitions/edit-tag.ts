import type { TagResponseDto } from "../../../dto/collection-items.dto";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
    GameDataType,
    ResultMappingStrategy,
    selectionStrategyChooseOne,
    selectionStrategySelectNumber,
} from "../selection-strategies";

export const buildEditTagScreen = (tag: TagResponseDto): FormScreenProps => ({
  method: "PATCH",
  action: `game-api/tags/${tag.id}`,
  title: `Edit ${tag.name}`,
  fields: [
    formText({
      name: "name",
      label: "Tag name",
      required: true,
      initialValue: tag.name,
    }),
    formText({
      name: "description",
      label: "Description",
      initialValue: tag.description ?? "",
    }),
    formSearch({
      name: "parentId",
      label: "Parent tag",
      resultMapping: ResultMappingStrategy.SINGLE_VALUE_ONLY,
      params: {
        dataTypes: [GameDataType.TAG],
        strategy: selectionStrategyChooseOne(),
        correctnessStrategy: selectionStrategySelectNumber({ max: 1 }),
        title: "Parent tag",
        currentSelection: tag.parentId
          ? [
              {
                type: GameDataType.TAG,
                value: tag.parentId,
                name: tag.parentId,
              },
            ]
          : [],
      },
    }),
  ],
});
