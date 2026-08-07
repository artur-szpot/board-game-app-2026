import type { FC, ReactNode } from "react";

import {
    FrameTypeEnum,
    selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppSelector } from "../../store/hooks";
import { FormScreen } from "../screens/FormScreen";
import type { FormScreenPropsFull } from "../screens/FormScreenProps";
import { GameDetailsScreen } from "../screens/GameDetailsScreen";
import type { GameDetailsScreenPropsFull } from "../screens/GameDetailsScreenProps";
import { LocationDetailsScreen } from "../screens/LocationDetailsScreen";
import type { LocationDetailsScreenPropsFull } from "../screens/LocationDetailsScreenProps";
import { OptionsScreen } from "../screens/OptionsScreen";
import type { OptionsScreenPropsFull } from "../screens/OptionsScreenProps";
import { SearchScreen } from "../screens/SearchScreen";
import type { SearchScreenPropsFull } from "../screens/SearchScreenProps";
import { TagDetailsScreen } from "../screens/TagDetailsScreen";
import type { TagDetailsScreenPropsFull } from "../screens/TagDetailsScreenProps";

type FrameStackScreenWrapperProps = {
  children: ReactNode;
};

export const FrameStackScreenWrapper: FC<FrameStackScreenWrapperProps> = ({
  children,
}: FrameStackScreenWrapperProps) => {
  const topFrame = useAppSelector(selectTopFrame);

  if (!topFrame) {
    throw new Error("No frames in the frame stack");
  }

  switch (topFrame.frameType) {
    case FrameTypeEnum.SELF:
      return <>{children}</>;
    case FrameTypeEnum.OPTIONS: {
      const optionsParams = topFrame.params as OptionsScreenPropsFull;
      return <OptionsScreen {...optionsParams} />;
    }
    case FrameTypeEnum.SEARCH: {
      const searchParams = topFrame.params as SearchScreenPropsFull;
      return <SearchScreen {...searchParams} />;
    }
    case FrameTypeEnum.FORM: {
      const formParams = topFrame.params as FormScreenPropsFull;
      return <FormScreen {...formParams} />;
    }
    case FrameTypeEnum.GAME_DETAILS: {
      const gameDetailsParams = topFrame.params as GameDetailsScreenPropsFull;
      return <GameDetailsScreen {...gameDetailsParams} openedAsFrame={true} />;
    }
    case FrameTypeEnum.TAG_DETAILS: {
      const tagDetailsParams = topFrame.params as TagDetailsScreenPropsFull;
      return <TagDetailsScreen {...tagDetailsParams} openedAsFrame={true} />;
    }
    case FrameTypeEnum.LOCATION_DETAILS: {
      const locationDetailsParams =
        topFrame.params as LocationDetailsScreenPropsFull;
      return (
        <LocationDetailsScreen
          {...locationDetailsParams}
          openedAsFrame={true}
        />
      );
    }
    default:
      return <h1>Not implemented yet</h1>;
  }
};
