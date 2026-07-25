import type { FC, ReactNode } from "react";

import { FormScreen } from "../screens/FormScreen";
import { OptionsScreen } from "../screens/OptionsScreen";
import { SearchScreen } from "../screens/SearchScreen";
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
    case FrameTypeEnum.OPTIONS:
      return <OptionsScreen {...topFrame.getOptionsScreenProps()} />;
    case FrameTypeEnum.SEARCH:
      return <SearchScreen {...topFrame.getSearchScreenProps()} />;
    case FrameTypeEnum.FORM:
      return <FormScreen {...topFrame.getFormScreenProps()} />;
    default:
      return <h1>Not implemented yet</h1>;
  }
};
