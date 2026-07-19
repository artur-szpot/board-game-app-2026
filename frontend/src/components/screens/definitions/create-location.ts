import type { FrameStackDto } from "../../../store/features/frameStackSlice";
import { formCheckbox } from "../../forms/FormCheckboxField";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
  GameDataType,
  ResultMappingStrategy,
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "../selection-strategies";

export const createLocationScreen: FrameStackDto<FormScreenProps> = {
  params: {
    method: "POST",
    action: "game-api/locations",
    title: "Add new location",
    fields: [
      formText({
        name: "name",
        label: "Location name",
        required: true,
      }),
      formText({
        name: "description",
        label: "Description",
      }),
      formCheckbox({
        name: "isGameId",
        label: "This location is a game box",
        checked: false,
      }),
      formSearch({
        name: "parentId",
        label: "Parent location",
        resultMapping: ResultMappingStrategy.SINGLE_VALUE_ONLY,
        params: {
          dataTypes: [GameDataType.LOCATION],
          strategy: selectionStrategyChooseOne(),
          correctnessStrategy: selectionStrategySelectNumber({ max: 1 }),
          title: "Parent location",
        },
      }),
      // TODO: allow to add existing games into this location as it's being created
    ],
  },
};
