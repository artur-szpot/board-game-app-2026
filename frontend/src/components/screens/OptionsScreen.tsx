import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useState, type FC } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import { MainActions } from "../MainActions";
import {
  mapOptionToSelectionResult,
  type OptionProps,
  type OptionsScreenPropsFull,
} from "./OptionsScreenProps";
import type {
  SelectionResult,
  SelectionStrategy,
} from "./selection-strategies";
import {
  isConfirmAllowed,
  isSelectionCorrect,
  SelectionStrategyEnum,
} from "./selection-strategies";
import { typeIcon } from "./type-icon";

export const OptionsScreen: FC<OptionsScreenPropsFull> = ({
  frameId,
  dataType,
  title,
  strategy,
  options,
}: OptionsScreenPropsFull) => {
  const [chosen, setChosen] = useState<SelectionResult[]>(
    options
      .filter(option => option.chosen)
      .map(mapOptionToSelectionResult(dataType)),
  );

  const dispatch = useAppDispatch();
  const dispatchResults = (_chosen: SelectionResult[]) =>
    dispatch(
      closeFrame({
        id: frameId,
        result: buildChoiceMadeFromItems(_chosen),
      }),
    );

  const onOptionClick = ((_strategy: SelectionStrategy) => {
    switch (_strategy.strategy) {
      case SelectionStrategyEnum.CHOOSE_ONE:
        return (option: OptionProps) =>
          dispatchResults([mapOptionToSelectionResult(dataType)(option)]);
      case SelectionStrategyEnum.SELECT_MULTIPLE:
        return (option: OptionProps) => {
          const isChosen = chosen.findIndex(c => c.value === option.value);
          const newChosen = [...chosen];
          if (isChosen !== -1) {
            newChosen.splice(isChosen, 1);
          } else {
            newChosen.push(mapOptionToSelectionResult(dataType)(option));
          }
          setChosen(newChosen);
        };
    }
  })(strategy);

  return (
    <div className="options-screen">
      <section aria-label="options screen">
        <Stack spacing={2}>
          <Typography component="h2" variant="h5">
            {title}
          </Typography>
          <List>
            {options.map(option => (
              <ListItem key={option.value} disablePadding>
                <ListItemButton
                  onClick={() => onOptionClick(option)}
                  aria-label={option.label}
                >
                  {strategy.strategy ===
                    SelectionStrategyEnum.SELECT_MULTIPLE &&
                    chosen.some(c => c.value === option.value) && (
                      <CheckCircleIcon color="secondary" sx={{ mr: 1 }} />
                    )}
                  <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                    {typeIcon(dataType)}
                  </ListItemIcon>
                  <ListItemText primary={option.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <MainActions
            allowConfirm={isConfirmAllowed(strategy)}
            confirmEnabled={isSelectionCorrect(strategy, chosen.length)}
            confirmCallback={() => dispatchResults(chosen)}
            frameId={frameId}
          />
        </Stack>
      </section>
    </div>
  );
};
