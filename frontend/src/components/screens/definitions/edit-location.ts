import type { LocationResponseDto } from "../../../dto/collection-items.dto";
import { formSearch } from "../../forms/FormSearchField";
import { formText } from "../../forms/FormTextField";
import type { FormScreenProps } from "../FormScreenProps";
import {
    GameDataType,
    ResultMappingStrategy,
    selectionStrategyChooseOne,
    selectionStrategySelectNumber,
} from "../selection-strategies";

export const buildEditLocationScreen = (
  location: LocationResponseDto,
): FormScreenProps => ({
  method: "PATCH",
  action: `game-api/locations/${location.id}`,
  title: `Edit ${location.name}`,
  fields: [
    formText({
      name: "name",
      label: "Location name",
      required: true,
      initialValue: location.name,
    }),
    formText({
      name: "description",
      label: "Description",
      initialValue: location.description ?? "",
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
        currentSelection: location.parentId
          ? [
              {
                type: GameDataType.LOCATION,
                value: location.parentId,
                name: location.path.at(-2)?.name ?? location.parentId,
              },
            ]
          : [],
      },
    }),
  ],
});
