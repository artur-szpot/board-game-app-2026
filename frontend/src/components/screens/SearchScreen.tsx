import axios from "axios";
import type { ChangeEvent, FC } from "react";
import { useEffect, useState } from "react";

import { buildChoiceMadeFromItems } from "../../store/features/frame-actions";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch } from "../../store/hooks";
import { MainActions } from "../MainActions";
import type { SearchScreenPropsFull } from "./SearchScreenProps";
import {
  isConfirmAllowed,
  isSelectionCorrect,
  SelectionStrategyEnum,
  type SelectionResult,
  type SelectionStrategy,
} from "./selection-strategies";

const INPUT_STABILITY_IN_MS = 500;

export const SearchScreen: FC<SearchScreenPropsFull> = ({
  frameId,
  initialSearchTerm,
  title,
  strategy,
  dataTypes,
  currentSelection: preselection,
}: SearchScreenPropsFull) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm ?? "");
  const [results, setResults] = useState<SelectionResult[]>([]);
  const [chosen, setChosen] = useState<SelectionResult[]>(preselection ?? []);

  const dispatch = useAppDispatch();
  const dispatchResults = (_results: SelectionResult[]) =>
    dispatch(
      closeFrame({
        id: frameId,
        result: buildChoiceMadeFromItems(_results),
      }),
    );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fetchResults = async () => {
        try {
          // TODO wire pagination and filters into this
          const response = await axios.get<{
            results: SelectionResult[];
          }>(`${import.meta.env.VITE_API_URL as string}/game-api/search`, {
            params: {
              types: dataTypes,
              searchTerm,
            },
          });
          setResults(response.data.results);
        } catch (error) {
          console.log(
            `Error while fetching search results: ${(error as Error).message}`,
          );
          setResults([]);
        }
      };
      void fetchResults();
    }, INPUT_STABILITY_IN_MS);

    return () => window.clearTimeout(timer);
  }, [dataTypes, searchTerm]);

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

  return (
    <div className="search-screen">
      <section aria-label={`search screen`}>
        <h2>{title}</h2>
        <input
          aria-label={`Search term`}
          value={searchTerm}
          onChange={handleChange}
        />
        <ul>
          {results.length === 0 && <p>No matching results found</p>}
          {results.map(result => (
            <li key={`${result.type}:${result.value}`}>
              <button type="button" onClick={() => onOptionClick(result)}>
                {result.name} ({result.type})
              </button>
            </li>
          ))}
        </ul>
        <MainActions
          allowConfirm={isConfirmAllowed(strategy)}
          confirmEnabled={isSelectionCorrect(strategy, chosen.length)}
          confirmCallback={() => dispatchResults(chosen)}
          frameId={frameId}
        />
      </section>
    </div>
  );
};
