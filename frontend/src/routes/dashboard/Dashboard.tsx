import { useEffect } from "react";

import { createLocationScreen } from "../../components/screens/definitions/create-location";
import { FormScreen } from "../../components/screens/FormScreen";
import { OptionsScreen } from "../../components/screens/OptionsScreen";
import { SearchScreen } from "../../components/screens/SearchScreen";
import {
  GameDataType,
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "../../components/screens/selection-strategies";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import type { FrameCallbackContent } from "../../store/features/frameStackSlice";
import {
  FrameTypeEnum,
  openFormFrame,
  openOptionsFrame,
  openSearchFrame,
  resetToBottomFrameWithReceiver,
  selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  const topFrame = useAppSelector(selectTopFrame);
  if (!topFrame) {
    throw new Error("No frames in the frame stack");
  }

  useEffect(() => {
    dispatch(
      resetToBottomFrameWithReceiver((result: FrameCallbackContent) =>
        alert(JSON.stringify(result)),
      ),
    );
  }, [dispatch]);

  if (!accessToken) {
    return <p>Not logged in!</p>;
  }

  switch (topFrame.frameType) {
    case FrameTypeEnum.SELF:
      break;
    case FrameTypeEnum.OPTIONS:
      return <OptionsScreen {...topFrame.getOptionsScreenProps()} />;
    case FrameTypeEnum.SEARCH:
      return <SearchScreen {...topFrame.getSearchScreenProps()} />;
    case FrameTypeEnum.FORM:
      return <FormScreen {...topFrame.getFormScreenProps()} />;
    default:
      return <h1>Not implemented yet</h1>;
  }

  return (
    <>
      <p>{`This is the dashboard! - logged in with token ${accessToken}`}</p>
      <button
        type="button"
        value="Option test 1"
        onClick={() =>
          dispatch(
            openOptionsFrame({
              params: {
                dataType: GameDataType.OTHER,
                options: [
                  {
                    label: "Option 1",
                    value: "1",
                  },
                  {
                    label: "Option 2",
                    value: "2",
                  },
                  {
                    label: "Option 3",
                    value: "3",
                  },
                ],
                strategy: selectionStrategyChooseOne(),
                title: "Test Options Screen",
              },
            }),
          )
        }
      >
        {"abc"}
      </button>
      <button
        type="button"
        value="Option test 2"
        onClick={() =>
          dispatch(
            openOptionsFrame({
              params: {
                dataType: GameDataType.OTHER,
                options: [
                  {
                    label: "Option 1",
                    value: "1",
                  },
                  {
                    label: "Option 2",
                    value: "2",
                  },
                  {
                    label: "Option 3",
                    value: "3",
                  },
                ],
                strategy: selectionStrategySelectNumber({ min: 2 }),
                title: "Test Options Screen",
              },
            }),
          )
        }
      >
        {"multimulti"}
      </button>
      <button
        type="button"
        value="Search test 1"
        onClick={() =>
          dispatch(
            openSearchFrame({
              params: {
                dataTypes: [GameDataType.GAME],
                strategy: selectionStrategySelectNumber({ min: 2 }),
                title: "Test Search Screen",
              },
            }),
          )
        }
      >
        {"search games"}
      </button>
      <button
        type="button"
        value="Form test 1"
        onClick={() => dispatch(openFormFrame(createLocationScreen))}
      >
        {"create location"}
      </button>
    </>
  );
};
