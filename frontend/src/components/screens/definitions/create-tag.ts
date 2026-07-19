import type { FrameStackDto } from "../../../store/features/frameStackSlice";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
  GameDataType,
  ResultMappingStrategy,
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "../selection-strategies";

export const createTagScreen: FrameStackDto<FormScreenProps> = {
  params: {
    method: "POST",
    action: "game-api/tags",
    title: "Add new tag",
    fields: [
      formText({
        name: "name",
        label: "Tag name",
        required: true,
      }),
      formText({
        name: "description",
        label: "Description",
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
        },
      }),
      // TODO: allow to add this to existing games as it's being created
    ],
  },
};
