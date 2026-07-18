import { useEffect } from "react";

import { OptionsScreen } from "../../components/screens/OptionsScreen";
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
import {
  selectionStrategyChooseOne,
  selectionStrategySelectNumber,
} from "../../components/screens/selection-strategies";
import { SearchScreen } from "../../components/screens/SearchScreen";
import { FormScreen } from "../../components/screens/FormScreen";
import { formText } from "../../components/forms/FormTextField";
import { formCheckbox } from "../../components/forms/FormCheckboxField";
import { formOptions } from "../../components/forms/FormOptionsField";
import { GameLength } from "../../dto/game-length.enum";

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
                dataType: "other",
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
                dataType: "other",
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
                dataTypes: ["game"],
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
        onClick={() =>
          dispatch(
            openFormFrame({
              params: {
                title: "Test Form Screen",
                fields: [
                  formText({
                    name: "gameName",
                    label: "Game name",
                    required: true,
                  }),
                  formText({
                    name: "gameDescription",
                    label: "Description",
                    initialValue: "Test description",
                  }),
                  formCheckbox({
                    name: "isPlayable",
                    label: "Playable",
                    checked: true,
                  }),
                  formCheckbox({
                    name: "isTransportable",
                    label: "Can you transport it?",
                    checked: false,
                  }),
                  formOptions({
                    name: "gameLength",
                    label: "Game length",
                    params: {
                      title: "Game length",
                      dataType: "other",
                      options: [
                        {
                          label: "Filler",
                          value: GameLength.FILLER,
                        },
                        {
                          label: "Short",
                          value: GameLength.SHORT,
                        },
                        {
                          label: "Medium",
                          value: GameLength.MEDIUM,
                        },
                        {
                          label: "Long",
                          value: GameLength.LONG,
                        },
                      ],
                      strategy: selectionStrategyChooseOne(),
                    },
                  }),
                ],
              },
            }),
          )
        }
      >
        {"search games"}
      </button>
    </>
  );
};
