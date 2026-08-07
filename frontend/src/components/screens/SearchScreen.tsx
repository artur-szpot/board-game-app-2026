import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import type { ChangeEvent, FC } from "react";
import { useEffect, useState } from "react";

import { RadioButtonUnchecked } from "@mui/icons-material";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { MainActions } from "../MainActions";
import type { SearchScreenPropsFull } from "./SearchScreenProps";
import type { SearchResult } from "./selection-strategies";
import {
  isConfirmAllowed,
  isSameSelectionResult,
  isSelectionCorrect,
  SelectionStrategyEnum,
  type SelectionResult,
  type SelectionStrategy,
} from "./selection-strategies";
import { typeIcon } from "./type-icon";

const INPUT_STABILITY_IN_MS = 500;

export const SearchScreen: FC<SearchScreenPropsFull> = ({
  frameId,
  initialSearchTerm,
  title,
  strategy,
  dataTypes,
  currentSelection: preselection,
}: SearchScreenPropsFull) => {
  // What is being sought
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm ?? "");
  // What has been found
  const [results, setResults] = useState<SelectionResult[]>([]);
  // What has been selected
  const [chosen, setChosen] = useState<SelectionResult[]>(preselection ?? []);

  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const dispatchResults = (_results: SelectionResult[]) =>
    dispatch(
      closeFrame({
        id: frameId,
        result: buildChoiceMadeFromItems(_results),
      }),
    );

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        const fetchResults = async () => {
          if (!accessToken) {
            setResults([]);
            return;
          }

          try {
            // TODO wire pagination and filters into this
            const response = await axios.post<{
              results: SearchResult[];
              total: number;
            }>(
              `${import.meta.env.VITE_API_URL as string}/game-api/search`,
              {
                types: dataTypes,
                searchTerm,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );
            setResults(
              response.data.results.map(result => ({
                value: result.id,
                name: result.name,
                type: result.type,
              })),
            );
          } catch (error) {
            console.log(
              `Error while fetching search results: ${(error as Error).message}`,
            );
            setResults([]);
          }
        };
        void fetchResults();
      },
      searchTerm.length > 0 ? INPUT_STABILITY_IN_MS : 0,
    );

    return () => window.clearTimeout(timer);
  }, [accessToken, dataTypes, searchTerm]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchTerm(nextValue);
  };

  const onOptionClick = ((_strategy: SelectionStrategy) => {
    switch (_strategy.strategy) {
      case SelectionStrategyEnum.CHOOSE_ONE:
        return (result: SelectionResult) => dispatchResults([result]);
      case SelectionStrategyEnum.SELECT_MULTIPLE:
        return (result: SelectionResult) => {
          const isChosen = chosen.findIndex(
            c => c.type === result.type && c.value === result.value,
          );
          const newChosen = [...chosen];
          if (isChosen !== -1) {
            newChosen.splice(isChosen, 1);
          } else {
            newChosen.push(result);
          }
          setChosen(newChosen);
        };
    }
  })(strategy);

  // TODO: add a loader for when API call is being made
  return (
    <div className="search-screen">
      <section aria-label="search screen">
        <Stack spacing={2}>
          <Typography component="h2" variant="h5">
            {title}
          </Typography>
          <TextField
            label="Search term"
            value={searchTerm}
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear search"
                      onClick={() => setSearchTerm("")}
                      edge="end"
                      size="small"
                      disabled={searchTerm.length === 0}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <List>
            {results.length === 0 && (
              <ListItem>
                <Typography
                  component="p"
                  variant="body2"
                  color="text.secondary"
                >
                  No matching results found
                </Typography>
              </ListItem>
            )}
            {results.map(result => (
              <ListItem key={`${result.type}:${result.value}`} disablePadding>
                <ListItemButton
                  onClick={() => onOptionClick(result)}
                  aria-label={result.name}
                >
                  {strategy.strategy ===
                    SelectionStrategyEnum.SELECT_MULTIPLE &&
                  chosen.some(c => isSameSelectionResult(c, result)) ? (
                    <CheckCircleIcon color="inherit" sx={{ mr: 1 }} />
                  ) : (
                    <RadioButtonUnchecked color="inherit" sx={{ mr: 1 }} />
                  )}
                  <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                    {typeIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText primary={result.name} />
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
