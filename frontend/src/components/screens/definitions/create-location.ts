import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
  GameDataType,
  ResultMappingStrategy,
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "../selection-strategies";

export const createLocationScreen: FormScreenProps = {
  method: "POST",
  action: "game-api/locations",
  title: "Add a new location",
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
};
