import type { FC, ReactNode } from "react";

import { FormScreen } from "../screens/FormScreen";
import type { FormScreenPropsFull } from "../screens/FormScreenProps";
import { OptionsScreen } from "../screens/OptionsScreen";
import type { OptionsScreenPropsFull } from "../screens/OptionsScreenProps";
import { SearchScreen } from "../screens/SearchScreen";
import type { SearchScreenPropsFull } from "../screens/SearchScreenProps";
import { useAppSelector } from "../../store/hooks";
import { FrameTypeEnum, selectTopFrame } from "../../store/features/frameStackSlice";

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
    default:
      return <h1>Not implemented yet</h1>;
  }
};
